// src/components/FileUpload.tsx
import { createSignal, Show, For } from "solid-js";

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export function FileUpload() {
  const [files, setFiles] = createSignal<FileList | null>(null);
  const [uploading, setUploading] = createSignal(false);
  const [uploadedFiles, setUploadedFiles] = createSignal<UploadedFile[]>([]);
  const [error, setError] = createSignal<string | null>(null);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFiles(target.files);
    setError(null);
  };

  const uploadFiles = async () => {
    const fileList = files();
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Upload failed (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Upload failed (${
            response.status
          }): ${responseText.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Invalid response format: ${responseText.substring(0, 200)}`
        );
      }

      setUploadedFiles([...uploadedFiles(), ...result.files]);

      const input = document.getElementById("file-input") as HTMLInputElement;
      if (input) input.value = "";
      setFiles(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div class="max-w-2xl mx-auto p-6 sm:p-8 bg-white text-neutral-800 rounded-lg shadow-lg space-y-6">
      <h2 class="text-2xl font-bold text-neutral-800 mb-6 text-center">
        File Upload
      </h2>

      <div class="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <div class="mb-4">
          <svg
            class="mx-auto h-12 w-12 text-neutral-500"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          class="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
        />

        <label
          for="file-input"
          class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </label>

        <p class="text-neutral-600 mt-2">
          or drag and drop files here
          <br />
          <span class="text-xs">
            Supported: JPG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX (max 10MB)
          </span>
        </p>
      </div>

      <Show when={files() && files()!.length > 0}>
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-neutral-700">
            Selected Files:
          </h3>
          <div class="space-y-2">
            <For each={Array.from(files()!)}>
              {(file) => (
                <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        class="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-neutral-900">{file.name}</p>
                      <p class="text-sm text-neutral-600">
                        {formatFileSize(file.size)} •{" "}
                        {file.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>

          <button
            onClick={uploadFiles}
            disabled={uploading()}
            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading() ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </Show>

      <Show when={error()}>
        <div class="p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <svg
              class="w-5 h-5 text-red-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-800 font-medium">Upload Error</p>
              <p class="text-sm text-red-700 mt-1">{error()}</p>
            </div>
          </div>
        </div>
      </Show>

      <Show when={uploadedFiles().length > 0}>
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-neutral-700">
            Uploaded Files:
          </h3>
          <div class="space-y-3">
            <For each={uploadedFiles()}>
              {(file) => (
                <div class="flex items-center justify-between p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        class="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-neutral-900">{file.name}</p>
                      <p class="text-sm text-neutral-600">
                        {formatFileSize(file.size)} • Uploaded{" "}
                        {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View
                  </a>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
