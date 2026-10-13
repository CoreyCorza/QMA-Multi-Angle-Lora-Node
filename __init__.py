AZIMUTHS = (
    "front view", "front-right quarter view", "right side view",
    "back-right quarter view", "back view", "back-left quarter view",
    "left side view", "front-left quarter view",
)
ELEVATIONS = ("low-angle shot", "eye-level shot", "elevated shot", "high-angle shot")
DISTANCES = ("close-up", "medium shot", "wide shot")


class QMACameraAngles:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
            "azimuth": (list(AZIMUTHS), {"default": "front view"}),
            "elevation": (list(ELEVATIONS), {"default": "eye-level shot"}),
            "distance": (list(DISTANCES), {"default": "medium shot"}),
        }}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "build_prompt"
    CATEGORY = "Qwen/QMA"
    DESCRIPTION = "Drag the camera to build a QMA LoRA prompt. Connect prompt to your Qwen Image 2.1 Edit text encoder. The edit workflow still requires a source image and the QMA LoRA. Directions are relative to the original camera."

    def build_prompt(self, azimuth, elevation, distance):
        return (f"<qma> {azimuth} {elevation} {distance}",)


NODE_CLASS_MAPPINGS = {"QMA_MultiCameraAngle": QMACameraAngles}
NODE_DISPLAY_NAME_MAPPINGS = {"QMA_MultiCameraAngle": "QMA Camera Angles · Qwen 2.1"}
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
