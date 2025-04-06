"use client";

import { useState } from "react";

import { toast } from "sonner";
import { FileUp, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

export default function UploadComponent() {
  const api = useTRPC();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [content, setContent] = useState<string>();

  const { mutate: uploadMutation, isPending } = useMutation(
    api.resources.upload.mutationOptions({
      onSuccess: (data) => {
        setProgress(100);
        setContent(data.id);
        toast.success(`PDF processed with ${data.pageCount} pages`);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message);
      },
    })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker."
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024
    );
    console.log(validFiles);

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    const file = files[0];
    setTitle(file.name);
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    uploadMutation(formData);
  };

  // Function to reset the component state
  const clearPDF = () => {
    setFiles([]);
    setTitle(undefined);
    setProgress(0);
    setContent(undefined);
  };

  return (
    <div
      className="sticky top-4 min-h-[200px] w-full flex justify-center max-h-[calc(100vh-2rem)] overflow-visible"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        console.log(e.dataTransfer.files);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDFs only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <FileUp className="h-6 w-6" />
            </div>
            <Plus className="h-4 w-4" />
            <div className="rounded-full bg-primary/10 p-2">
              <Loader2 className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              PDF Embeddings Generator
            </CardTitle>
            <CardDescription className="text-base">
              Upload a PDF to generate embeddings for the content
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {files.length > 0 ? (
                  <span className="font-medium text-foreground">
                    {files[0].name}
                  </span>
                ) : (
                  <span>Drop your PDF here or click to browse.</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={files.length === 0 || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
              {files.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearPDF}
                  disabled={isPending}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        {title && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="w-full space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isPending ? "bg-yellow-500/50 animate-pulse" : "bg-muted"
                  }`}
                />
                <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                  {isPending
                    ? "Analyzing PDF content..."
                    : "Processing complete"}
                </span>
              </div>
            </div>
          </CardFooter>
        )}
        {content && (
          <CardContent className="border-t pt-4 mt-2">
            <div className="text-sm font-medium mb-2">Content Preview:</div>
            <div className="text-xs max-h-40 overflow-y-auto border rounded p-2 bg-muted/50">
              {content.slice(0, 500)}
              {content.length > 500 && "..."}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
