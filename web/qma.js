import { app } from "../../../scripts/app.js";

const SHORT = ["FRONT", "FRONT-R", "RIGHT", "BACK-R", "BACK", "BACK-L", "LEFT", "FRONT-L"];
const HEIGHTS = ["LOW", "EYE LEVEL", "ELEVATED", "HIGH"];
const RADII = [48, 78, 108];
const W = 460, H = 340, CX = 166, CY = 141;

function mount(node) {
    const fields = ["azimuth", "elevation", "distance"].map(name => node.widgets.find(w => w.name === name));
    const root = document.createElement("div");
    root.style.cssText = "display:flex;flex-direction:column;gap:8px;box-sizing:border-box;padding-bottom:4px;width:100%;height:100%;min-height:0;overflow:hidden;";
    const viewport = document.createElement("div");
    viewport.style.cssText = "position:relative;display:flex;align-items:flex-start;justify-content:center;flex:1 1 0;min-height:0;overflow:hidden;background:#101821;border-radius:10px;";
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;display:block;flex:none;touch-action:none;outline:none;";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "group");
    canvas.setAttribute("aria-label", "QMA camera control. Left and right arrows orbit, up and down change height, plus and minus change distance. Dropdowns above provide the same controls.");
    viewport.append(canvas);
    root.append(viewport);
    node.addDOMWidget("qma_camera", "qma_camera", root, {
        serialize: false,
        getMinHeight: () => 250,
        getHeight: () => H + 70,
    });

    const indices = () => fields.map(w => Math.max(0, w.options.values.indexOf(w.value)));
    function set(index, value) {
        const w = fields[index];
        const next = w.options.values[value];
        if (next === w.value) return;
        w.value = next;
        w.callback?.(next);
        node.graph?.change();
        node.setDirtyCanvas(true, true);
    }
    function draw() {
        const ratio = window.devicePixelRatio || 1;
        const scale = Math.min((viewport.clientWidth || W) / W, (viewport.clientHeight || H) / H);
        canvas.style.width = `${W * scale}px`;
        canvas.style.height = `${H * scale}px`;
        canvas.width = Math.max(1, Math.round(W * scale * ratio));
        canvas.height = Math.max(1, Math.round(H * scale * ratio));
        const ctx = canvas.getContext("2d");
        ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
        const [az, el, dist] = indices();
        ctx.fillStyle = "#101821"; ctx.fillRect(0, 0, W, H);
        function text(label, x, y, color = "#8299ad", size = 10, align = "center") {
            ctx.font = `500 ${size}px system-ui, sans-serif`; ctx.fillStyle = color;
            ctx.textAlign = align; ctx.fillText(label, x, y);
        }
        function line(x, y, x2, y2, color) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.stroke();
        }
        function circle(x, y, r, fill, stroke) {
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
        }
        ctx.lineWidth = 1;
        RADII.forEach((r, i) => circle(CX, CY, r, null, i === dist ? "#3e7e87" : "#273747"));
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            const sx = Math.sin(a), sy = Math.cos(a);
            line(CX + sx * 31, CY + sy * 31, CX + sx * 111, CY + sy * 111, "#223343");
            RADII.forEach(r => circle(CX + sx * r, CY + sy * r, 3, "#496071"));
            text(SHORT[i], CX + sx * 137, CY + sy * 128 + 4, i === az ? "#75efd5" : "#91a7ba", 10);
        }
        circle(CX, CY, 23, "#223547", "#4b6175");
        circle(CX, CY - 6, 5, "#c2d1dc");
        ctx.fillStyle = "#c2d1dc"; ctx.fillRect(CX - 8, CY + 2, 16, 8);
        const angle = az * Math.PI / 4;
        const x = CX + Math.sin(angle) * RADII[dist], y = CY + Math.cos(angle) * RADII[dist];
        line(CX, CY, x, y, "#75efd5");
        circle(x, y, 13, "#75efd5", "#c8fff1");
        ctx.save(); ctx.translate(x, y); ctx.rotate(-angle);
        ctx.fillStyle = "#102921"; ctx.fillRect(-7, -4, 14, 10); ctx.fillRect(-3, -7, 6, 3); ctx.restore();
        line(349, 52, 349, 206, "#385065");
        for (let i = 0; i < 4; i++) {
            const yy = 200 - i * 48;
            circle(349, yy, i === el ? 8 : 4, i === el ? "#75efd5" : "#496071");
            text(HEIGHTS[i], 365, yy + 4, i === el ? "#75efd5" : "#91a7ba", 10, "left");
        }
        text(fields[2].value.toUpperCase(), W / 2, 296, "#75efd5", 10);
        text("Directions are relative to the original camera, not the subject.", W / 2, 324, "#8299ad", 11);
        canvas.title = `<qma> ${fields.map(w => w.value).join(" ")}`;
        preview.textContent = canvas.title;
    }

    const preview = document.createElement("div");
    preview.style.cssText = "flex:0 0 58px;padding:9px 12px;box-sizing:border-box;width:100%;min-height:0;overflow:auto;overflow-wrap:anywhere;background:#16222d;color:#a9eedb;font:12px/18px monospace;user-select:text;border-radius:6px;";
    root.append(preview);
    let dragging = null;
    function update(event) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * W / rect.width;
        const y = (event.clientY - rect.top) * H / rect.height;
        if (dragging === "height") {
            set(1, Math.max(0, Math.min(3, Math.round((200 - y) / 48))));
        } else {
            const dx = x - CX, dy = y - CY;
            if (Math.hypot(dx, dy) > 15) {
                set(0, (Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) + 8) % 8);
                const radius = Math.hypot(dx, dy);
                set(2, RADII.reduce((best, r, i) => Math.abs(r - radius) < Math.abs(RADII[best] - radius) ? i : best, 0));
            }
        }
        draw();
    }
    canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation(); canvas.focus();
        const rect = canvas.getBoundingClientRect();
        dragging = (event.clientX - rect.left) * W / rect.width > 323 ? "height" : "orbit";
        canvas.setPointerCapture(event.pointerId); update(event);
    });
    canvas.addEventListener("pointermove", event => { if (dragging) { event.stopPropagation(); update(event); } });
    const release = event => {
        if (!dragging) return;
        dragging = null; event.stopPropagation();
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("lostpointercapture", () => { dragging = null; });
    canvas.addEventListener("keydown", event => {
        const [a, e, d] = indices();
        const actions = {
            ArrowRight: () => set(0, (a + 1) % 8), ArrowLeft: () => set(0, (a + 7) % 8),
            ArrowUp: () => set(1, Math.min(3, e + 1)), ArrowDown: () => set(1, Math.max(0, e - 1)),
            "+": () => set(2, Math.max(0, d - 1)), "=": () => set(2, Math.max(0, d - 1)),
            "-": () => set(2, Math.min(2, d + 1)),
        };
        if (actions[event.key]) { event.preventDefault(); event.stopPropagation(); actions[event.key](); draw(); }
    });
    fields.forEach(w => {
        const callback = w.callback;
        w.callback = function (...args) { const result = callback?.apply(this, args); draw(); return result; };
    });
    const configure = node.onConfigure;
    node.onConfigure = function (...args) { const result = configure?.apply(this, args); draw(); return result; };
    const observer = new ResizeObserver(draw);
    observer.observe(viewport);
    const removed = node.onRemoved;
    node.onRemoved = function (...args) { observer.disconnect(); return removed?.apply(this, args); };
    node.setSize([Math.max(node.size[0], 480), Math.max(node.size[1], 520)]);
    draw();
}

app.registerExtension({
    name: "QMA.MultiCameraAngle",
    beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "QMA_MultiCameraAngle") return;
        const created = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function (...args) {
            const result = created?.apply(this, args);
            mount(this);
            return result;
        };
    },
});
