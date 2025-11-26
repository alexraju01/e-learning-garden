import { cn } from "@/lib/classCombine";
import type { ClassNameValue } from "tailwind-merge";

export function PlusIcon({ classname }: { classname?: ClassNameValue }) {
	return (
		<svg
			className={cn("stroke-black", classname)}
			width="24"
			height="24"
			viewBox="0 0 24 24"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M5 12h14"></path>
			<path d="M12 5v14"></path>
		</svg>
	);
}
