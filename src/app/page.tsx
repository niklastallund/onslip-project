import Link from "next/link";
import Editor from "../components/Editor";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Editor />
    </div>
  );
}
