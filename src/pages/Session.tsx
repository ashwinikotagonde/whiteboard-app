import { useParams } from "react-router-dom";
import Whiteboard from "../components/Whiteboard";
import ImageUploader from "../components/ImageUploader";

export default function Session() {
  const { id } = useParams();

  return (
    <div className="container-fluid" style={{ height: "100vh", overflow: "hidden" }}>
      
      {/* Header */}
      <div className="row py-3 px-4 border-bottom bg-white shadow-sm">
        <div className="col d-flex justify-content-between align-items-center">
          <h4 className="m-0">📝 Whiteboard Session</h4>
          <span className="badge bg-primary fs-6 px-3 py-2">ID: {id}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="row h-100">
        
        {/* Left Sidebar - Image Uploader */}
        <div
          className="col-12 col-md-4 col-lg-3 border-end bg-light p-3"
          style={{ overflowY: "auto", height: "calc(100vh - 75px)" }}
        >
          <h5 className="mb-3">📷 AI Image Prediction</h5>
          <ImageUploader />
        </div>

        {/* Whiteboard Section */}
        <div
          className="col-12 col-md-8 col-lg-9 p-3"
          style={{ height: "calc(100vh - 75px)", overflow: "hidden" }}
        >
          <div className="whiteboard-wrapper bg-white shadow rounded" style={{ height: "100%" }}>
            <Whiteboard sessionId={id || ""} />
          </div>
        </div>

      </div>

    </div>
  );
}
