"use client";

import UploadComponent from "./upload-component";

import Chat from "./chat";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const trpc = useTRPC();
  const { data: resources } = useQuery(trpc.resources.list.queryOptions());
  console.log(resources);
  return (
    <div className="flex w-full py-24 mx-auto gap-4 h-[90vh] overflow-hidden">
      <div className="flex flex-col w-full max-w-md mx-auto stretch min-w-[50vw] px-14 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
        <Chat />
      </div>
      <div className="w-full max-w-md min-w-[50vw] sticky top-0">
        <UploadComponent />
      </div>
    </div>
  );
}
