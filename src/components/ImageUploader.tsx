import React, { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import type { MobileNet } from "@tensorflow-models/mobilenet";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

// Types
type MobileNetResult = {
  className: string;
  probability: number;
};

type Prediction = {
  className: string;
  probability: number;
};

const ImageUploader: FC = () => {
  const [model, setModel] = useState<MobileNet | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [predicting, setPredicting] = useState(false);

  // Load model
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoadingModel(true);

        await tf.setBackend("cpu");
        await tf.ready();

        const m = await mobilenet.load();
        if (active) setModel(m);
      } catch {
        setError("Failed to load model for predictions.");
      } finally {
        if (active) setLoadingModel(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Handle file upload
  const onFileChange = (file?: File) => {
    setError(null);
    setPredictions(null);

    if (!file) return setImageSrc(null);

    if (!file.type.startsWith("image/")) {
      return setError("Only image files allowed.");
    }

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.onerror = () => setError("Could not load image.");
    reader.readAsDataURL(file);
  };

  // Predict
  useEffect(() => {
    if (!model || !imageSrc) return;

    const predict = async () => {
      setPredicting(true);
      try {
        const img = imageRef.current;
        if (!img) return;

        if (!img.complete) {
          await new Promise((res) => {
            img.onload = () => res(null);
          });
        }

        const result = (await model.classify(img, 3)) as MobileNetResult[];

        setPredictions(
          result.map((p) => ({
            className: p.className,
            probability: p.probability,
          }))
        );
      } catch {
        setError("Prediction failed.");
      } finally {
        setPredicting(false);
      }
    };

    const timer = setTimeout(predict, 200);
    return () => clearTimeout(timer);
  }, [imageSrc, model]);

  return (
    <div className="card p-3">
      <h5 className="mb-2">Image Upload & Prediction</h5>

      {/* FIXED: Only vertical layout */}
      <div className="d-flex flex-column gap-3">

        {/* Upload Section */}
        <div>
          <label className="form-label">Choose an image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />

          <div className="mt-3 d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setImageSrc(null);
                setPredictions(null);
                setError(null);
              }}
            >
              Clear
            </button>

            <button
              className="btn btn-primary"
              disabled={!imageSrc || !model}
              onClick={() => setPredictions(null)}
            >
              Classify
            </button>
          </div>

          {loadingModel && (
            <div className="alert alert-info mt-2 p-2">
              Loading model...
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-2 p-2">{error}</div>
          )}
        </div>

        {/* ------------- IMAGE PREVIEW BELOW INPUT ------------- */}
        <div
          style={{
            minHeight: 200,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 10,
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {imageSrc ? (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="preview"
              style={{ maxWidth: "100%", maxHeight: 260 }}
            />
          ) : (
            <div className="text-muted">No image selected</div>
          )}
        </div>

        {/* ------------- PREDICTIONS BELOW IMAGE ------------- */}
        <div>
          {predicting && (
            <div className="alert alert-info p-2">Predicting...</div>
          )}

          {predictions && (
            <>
              <h6>Predictions</h6>
              <ul className="list-group">
                {predictions.map((p, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <strong>{p.className}</strong>
                    <span className="badge bg-primary">
                      {(p.probability * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
