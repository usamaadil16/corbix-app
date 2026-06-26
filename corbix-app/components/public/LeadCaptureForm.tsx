"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";

type LeadCaptureFormProps = {
  serviceOptions: string[];
  sourcePage: string;
  submitLabel?: string;
  compact?: boolean;
};

export function LeadCaptureForm({
  serviceOptions,
  sourcePage,
  submitLabel = "Submit",
  compact = false,
}: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      client_name: "",
      company_name: "",
      phone: "",
      email: "",
      service_requested: serviceOptions[0] ?? "",
      source_page: sourcePage,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Could not submit");
      }

      toast.success("Thank you. Our team will contact you shortly.");
      reset({
        client_name: "",
        company_name: "",
        phone: "",
        email: "",
        service_requested: serviceOptions[0] ?? "",
        source_page: sourcePage,
      });
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-3 rounded-xl border border-white/10 bg-surface p-5 ${
        compact ? "" : "md:p-6"
      }`}
    >
      <input type="hidden" {...register("source_page")} />

      <div>
        <Input placeholder="Client Name" {...register("client_name")} />
        {errors.client_name ? (
          <p className="mt-1 text-xs text-accent">{errors.client_name.message}</p>
        ) : null}
      </div>
      <div>
        <Input placeholder="Company Name" {...register("company_name")} />
        {errors.company_name ? (
          <p className="mt-1 text-xs text-accent">{errors.company_name.message}</p>
        ) : null}
      </div>
      <div>
        <Input placeholder="Phone Number" {...register("phone")} />
        {errors.phone ? (
          <p className="mt-1 text-xs text-accent">{errors.phone.message}</p>
        ) : null}
      </div>
      <div>
        <Input placeholder="Email Address" type="email" {...register("email")} />
        {errors.email ? (
          <p className="mt-1 text-xs text-accent">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <Select {...register("service_requested")}>
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : submitLabel}
      </Button>
    </form>
  );
}
