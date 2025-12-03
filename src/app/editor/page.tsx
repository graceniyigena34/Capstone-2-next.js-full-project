"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

async function uploadCover(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && preset) {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);

    const response = await fetch(url, { method: "POST", body: form });
    if (!response.ok) {
      throw new Error("Cloud upload failed");
    }

    const data = await response.json();
    return data.secure_url as string;
  }

  const fallbackForm = new FormData();
  fallbackForm.append("file", file);
  const uploadResponse = await fetch("/api/media/upload", {
    method: "POST",
    body: fallbackForm,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }

  const payload = await uploadResponse.json();
  return payload.url as string;
}

export default function EditorPage() {
  const { data: session, status } = useSession()
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 420,
      toolbarAdaptive: true,
      buttons: typeof window !== 'undefined' && window.innerWidth < 640 
        ? "bold,italic,ul,ol,link,image" 
        : "bold,italic,underline,ul,ol,link,image,source",
      buttonsMD: "bold,italic,ul,ol,link,image",
      buttonsSM: "bold,italic,link",
      buttonsXS: "bold,italic",
      uploader: {
        insertImageAsBase64URI: false,
        async upload(file: File) {
          const url = await uploadCover(file);
          return {
            files: [url],
          };
        },
      },
    }),
    []
  );

  const handleTagAddition = () => {
    const normalized = tagInput.trim().toLowerCase();
    if (!normalized || tagList.includes(normalized)) return;
    setTagList((prev) => [...prev, normalized].slice(0, 8));
    setTagInput("");
  };

  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsSubmitting(true);
      const url = await uploadCover(file);
      setCoverImage(url);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const persistPost = async (publish: boolean) => {
    // Client-side validation
    if (!title || title.trim().length < 4) {
      alert("Title must be at least 4 characters long");
      return;
    }

    if (!content || content.trim().length < 20) {
      alert("Content must be at least 20 characters long. Please write more.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tagList,
          coverImage: coverImage || undefined,
          published: publish,
        }),
      });

      const payload = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (payload.error && typeof payload.error === 'object') {
          const errorMessages = Object.entries(payload.error)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(payload.error ?? "Failed to save post");
      }

      // Success - redirect
      if (publish) {
        // Show success message and redirect to explore to see the published story
        alert("Story published successfully! Redirecting to explore page...");
        router.push("/explore");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Post creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unable to save post. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-green-600">Editor</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Create a new story</h1>
        <p className="text-sm text-gray-500 mt-1">Draft, collaborate, and publish when you&apos;re ready.</p>
      </div>

      <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give your story an unforgettable title"
          className="w-full border-none text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none leading-tight"
        />

        <div className="space-y-2 sm:space-y-3">
          <label className="text-sm font-medium text-gray-700">Cover image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleCoverChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {coverImage && (
            <div className="relative mt-3 sm:mt-4 h-40 sm:h-56 w-full overflow-hidden rounded-xl sm:rounded-2xl">
              <Image src={coverImage} alt="Cover" fill className="object-cover" />
            </div>
          )}
        </div>

        <JoditEditor 
          value={content} 
          config={editorConfig} 
          onBlur={(newContent: string) => setContent(newContent)}
          onChange={(newContent: string) => setContent(newContent)}
        />

        <div className="space-y-2 sm:space-y-3">
          <label className="text-sm font-medium text-gray-700">Tags</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), handleTagAddition())}
              placeholder="Add up to 8 tags"
              className="flex-1 rounded-full border border-gray-200 px-3 sm:px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={handleTagAddition}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gray-100 px-2.5 sm:px-3 py-1 text-xs font-semibold text-gray-700"
              >
                #{tag}
                <button 
                  type="button" 
                  onClick={() => setTagList((prev) => prev.filter((item) => item !== tag))}
                  className="hover:text-red-600 transition-colors"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-center"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => persistPost(false)}
            disabled={isSubmitting}
            className="rounded-full bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-900 disabled:opacity-60 hover:bg-gray-300 transition-colors text-center"
          >
            {isSubmitting ? 'Saving...' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => persistPost(true)}
            disabled={isSubmitting}
            className="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-green-700 transition-colors text-center"
          >
            {isSubmitting ? 'Publishing...' : 'Publish to Explore'}
          </button>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4 sm:py-10">
          <div className="max-h-[95vh] sm:max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Preview</h2>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{title}</h3>
              {coverImage && (
                <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-xl sm:rounded-2xl">
                  <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
                </div>
              )}
              <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
