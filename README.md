# QMA Camera Angles — Qwen Image 2.1

A draggable camera prompt controller for the QMA camera-angle edit LoRA.
No additional Python packages or frontend build required.

Restart ComfyUI, refresh the browser, and search for **QMA Camera Angles**.
The node is in **Qwen / QMA**.

- Drag the camera around the subject to snap to eight azimuths.
- Drag inward or outward across the three rings for close-up, medium, or wide.
- Drag the height selector for low, eye-level, elevated, or high.
- The dropdowns offer the same controls and save in the workflow.
- Keyboard: left/right orbit, up/down height, plus/minus closer/farther.

The bottom of the orbit is the original/front camera position; right is the
original camera's right. These directions are relative to the original camera,
not the subject. The diagram is a selector, not a generated-image preview.

Connect the **prompt** STRING output to the prompt/text input of your existing
Qwen Image 2.1 Edit text encoder (convert its text widget to an input if needed).
Keep the source image connected to the edit workflow and load the QMA LoRA with
your usual LoRA loader. This node builds the prompt; it does not load a model,
LoRA, or image, or run generation.

Example output: `<qma> right side view eye-level shot medium shot`.
All 8 × 4 × 3 combinations use the LoRA's supplied vocabulary in that order.

## Installation

From your ComfyUI `custom_nodes` folder, run:

```sh
git clone https://github.com/CoreyCorza/QMA-Multi-Angle-Lora-Node.git
```

Restart ComfyUI and refresh the browser. Search for **QMA Camera Angles**.
If an earlier `ComfyUI-Qwen21-QMA-MultiCameraAngle` folder is installed, keep only
one copy of this node to avoid duplicate registration.

To update, run `git pull` inside the cloned folder, then restart and refresh.

<img width="712" height="803" alt="image" src="https://github.com/user-attachments/assets/10d1b5be-b4a2-4a76-83fa-3e3deea3d337" />
