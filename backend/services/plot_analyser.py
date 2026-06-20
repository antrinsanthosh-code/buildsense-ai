import os
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO
from pathlib import Path

model = YOLO("yolov8n.pt")

def analyse_plot(image_path: str) -> dict:
    """
    Analyse a land plot photo and extract key information.
    Returns structured data about the plot.
    """
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Could not load image"}

    height, width = img.shape[:2]
    
    results = model(image_path, verbose=False)
    detections = []
    for result in results:
        for box in result.boxes:
            label = result.names[int(box.cls)]
            confidence = float(box.conf)
            if confidence > 0.3:
                detections.append({
                    "label": label,
                    "confidence": round(confidence, 2)
                })
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))

    # Detect dominant colours (vegetation, soil, concrete)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    green_mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
    vegetation_pct = round(float(np.sum(green_mask > 0)) / (height * width) * 100, 1)

    brown_mask = cv2.inRange(hsv, (10, 40, 40), (30, 255, 200))
    soil_pct = round(float(np.sum(brown_mask > 0)) / (height * width) * 100, 1)

    # Estimate orientation from brightness (basic heuristic)
    top_half = float(np.mean(gray[:height//2, :]))
    bottom_half = float(np.mean(gray[height//2:, :]))
    orientation = "north-facing" if top_half > bottom_half else "south-facing"

    return {
        "image_dimensions": {"width": width, "height": height},
        "detections": detections,
        "vegetation_percentage": vegetation_pct,
        "soil_percentage": soil_pct,
        "orientation_estimate": orientation,
        "brightness": round(brightness, 1),
        "analysis_notes": generate_notes(vegetation_pct, soil_pct, detections)
    }

def generate_notes(vegetation_pct, soil_pct, detections):
    notes = []
    if vegetation_pct > 30:
        notes.append("High vegetation — clearing required before construction")
    elif vegetation_pct > 10:
        notes.append("Moderate vegetation — partial clearing needed")
    else:
        notes.append("Low vegetation — plot is mostly clear")

    if soil_pct > 40:
        notes.append("Significant exposed soil — good for foundation work")

    detected_labels = [d["label"] for d in detections]
    if "tree" in detected_labels or "plant" in detected_labels:
        notes.append("Trees or plants detected — may need removal")
    if "car" in detected_labels or "truck" in detected_labels:
        notes.append("Vehicles detected — ensure plot boundaries are clear")

    return notes