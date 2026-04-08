"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

export default function ProcurementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const pageSeed = 'procurement'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    signAddress: "",
    coordinates: "",
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
      formDataToSend.append("signAddress", formData.signAddress);
      if (formData.coordinates) formDataToSend.append("coordinates", formData.coordinates);
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
      setFormData({ name: "", email: "", signAddress: "", coordinates: "", width: "", length: "", unit: "in" });
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
        <div className="mb-16 relative z-10">
          <h1 className="font-[family-name:var(--font-body)] font-bold text-5xl md:text-6xl mb-12 text-white">
            PROCUREMENT
          </h1>
          
          {/* Step 1: Text Left, Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <h2 className="font-[family-name:var(--font-body)] font-bold text-3xl md:text-4xl text-white leading-tight">
                Step 1, take a photo of a sign
              </h2>
            </div>
            <div className="aspect-[4/3] overflow-hidden flex items-center justify-center">
              <Image
                src="/images/PhotoSign_Transparent.png"
                alt="Take a photo of a sign"
                width={800}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Step 2: Image Left, Text Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div className="aspect-[4/3] overflow-hidden flex items-center justify-center order-2 md:order-1">
              <Image
                src="/images/SignBountyMap_Transparent.png"
                alt="Send us the sign address"
                width={800}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-[family-name:var(--font-body)] font-bold text-3xl md:text-4xl text-white leading-tight">
                Step 2, send us the sign address
              </h2>
            </div>
          </div>

          {/* Step 3: Text Left, Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <h2 className="font-[family-name:var(--font-body)] font-bold text-3xl md:text-4xl text-white leading-tight">
                Step 3, the sign mysteriously shows up at your door
              </h2>
            </div>
            <div className="aspect-[4/3] overflow-hidden flex items-center justify-center">
              <Image
                src="/images/FP_Box_Transparent.png"
                alt="Sign shows up at your door"
                width={800}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
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

          {/* Sign Address */}
          <div>
            <label htmlFor="signAddress" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Sign Address
            </label>
            <input
              type="text"
              id="signAddress"
              required
              value={formData.signAddress}
              onChange={(e) => setFormData({ ...formData, signAddress: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter the address or location of the sign"
              autoComplete="street-address"
            />
          </div>

          {/* Coordinates */}
          <div>
            <label htmlFor="coordinates" className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Coordinates (Optional)
            </label>
            <input
              type="text"
              id="coordinates"
              value={formData.coordinates}
              onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g., 42.3601° N, 71.0589° W"
            />
          </div>

          {/* Approximate Sign Dimensions */}
          <div>
            <label className="block text-sm font-[family-name:var(--font-body)] font-bold uppercase tracking-wider mb-2">
              Approximate Sign Dimensions (Optional)
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
              Sign Image
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

          {/* Disclaimer */}
          <p className="text-xs text-text-secondary text-center mt-4">
            When you place a procurement request, we will send you a price quote. We reserve the right to reject any order for reasons including but not limited to copyright, legal, or logistical reasons.
          </p>
        </form>
      </div>
    </main>
  );
}
