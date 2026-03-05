"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

export default function CustomDesignPage() {
  const [isMounted, setIsMounted] = useState(false);
  const pageSeed = 'custom'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    width: "",
    length: "",
    unit: "in" as "in" | "cm",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("description", formData.description);
      if (formData.width) formDataToSend.append("width", formData.width);
      if (formData.length) formDataToSend.append("length", formData.length);
      formDataToSend.append("unit", formData.unit);

      if (files) {
        Array.from(files).forEach((file) => {
          formDataToSend.append("files", file);
        });
      }

      const response = await fetch("/api/custom-request", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", description: "", width: "", length: "", unit: "in" });
      setFiles(null);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background spray patterns */}
      {isMounted && getSprayPlacements(8, pageSeed).map((spray, i) => (
        <img
          key={i}
          src={spray.src}
          alt=""
          className="fixed pointer-events-none z-0"
          style={{
            ...spray.pos,
            width: spray.size,
            height: 'auto',
            opacity: spray.opacity * 0.2,
            transform: `rotate(${spray.rotation}deg) scale(${spray.scale})`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/?shop=1"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>

        {/* Header */}
        <div className="mb-12 relative z-10">
          <Image
            src="/FP_Borderless.png"
            alt="Frathouse Picasso"
            width={200}
            height={67}
            className="w-[180px] h-auto mb-6"
          />
          <h1 className="font-[family-name:var(--font-body)] font-bold text-4xl md:text-5xl mb-4">
            CUSTOM DESIGN
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
            We create custom designs from your provided images or descriptions. Whether you have a specific vision or just an idea, 
            we'll work with you to bring it to life. Submit your request below and we'll get back to you with a quote.
          </p>
        </div>

        {/* Success Screen */}
        {submitStatus === "success" && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-green-700 bg-green-950/30 mb-8">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-body)] font-bold text-white text-2xl md:text-3xl mb-4">
              Your Picasso is in production.
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-xl mx-auto">
              Keep an eye on your inbox for updates and next steps.
            </p>
            <button
              onClick={() => setSubmitStatus("idle")}
              className="mt-10 inline-block border border-[#333] hover:border-white text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={`space-y-6 ${submitStatus === "success" ? "hidden" : ""}`}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Design Description
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Describe your design idea in detail..."
            />
          </div>

          {/* Sign Dimensions */}
          <div>
            <label className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Sign Dimensions (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="width" className="block text-xs text-text-secondary mb-1">
                  Width
                </label>
                <input
                  type="number"
                  id="width"
                  min="0"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="length" className="block text-xs text-text-secondary mb-1">
                  Length
                </label>
                <input
                  type="number"
                  id="length"
                  min="0"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-xs text-text-secondary mb-1">
                  Unit
                </label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as "in" | "cm" })}
                  className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="in">inches (in)</option>
                  <option value="cm">centimeters (cm)</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="files" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Reference Images (Optional)
            </label>
            <input
              type="file"
              id="files"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-xs text-text-secondary mt-2">
              Accepted formats: PNG, JPG, PDF (Max 10MB per file)
            </p>
          </div>

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="rounded-md border border-red-800 bg-red-950/30 px-4 py-3">
              <p className="text-sm text-red-400">
                ✗ {errorMessage || "Failed to submit request. Please try again."}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase py-4 rounded-md transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSubmitting ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
