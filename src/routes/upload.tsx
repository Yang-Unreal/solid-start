// src/routes/upload.tsx
import { Title } from "@solidjs/meta";
import { FileUpload } from "~/components/FileUpload";

export default function UploadPage() {
  return (
    <main class="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <Title>File Upload</Title>
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center text-neutral-800 dark:text-neutral-200 mb-8">
          File Upload
        </h1>
        <FileUpload />
      </div>
    </main>
  );
}
