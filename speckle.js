import {
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  CameraController
} from "https://unpkg.com/@speckle/viewer@2.14.1/build/index.esm.js";

async function initSpeckle() {
  const container = document.getElementById("speckleViewer");

  // Initialize Speckle Viewer
  const viewer = new Viewer(container, DefaultViewerParams);
  await viewer.init();

  // Add camera controls
  viewer.createExtension(CameraController);

  // Load model
  const urls = await UrlHelper.getResourceUrls(
    "https://speckle.xyz/streams/YOUR_STREAM_ID/models/YOUR_MODEL_ID"
  );

  for (const url of urls) {
    const loader = new SpeckleLoader(viewer.getWorldTree(), url, "");
    await viewer.loadObject(loader, true);
  }

  // Optional: Listen for live updates (if needed)
  // Not all versions of viewer support this yet.
  // You could add websocket listeners here if required.
}

initSpeckle();
