import { testMinIOConnection } from "./src/lib/minio";

// Test connection on startup
testMinIOConnection().then((success) => {
  if (success) {
    console.log("MinIO is ready for file uploads");
  } else {
    console.error("MinIO connection failed - uploads will not work");
  }
});
