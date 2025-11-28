import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/$workspaceId")({
	component: RouteComponent,
	// params: {workspaceId}
});

function RouteComponent() {
	//my role = ...myrole

	return (
		<div className="bg-neutral-400 flex w-full h-96">
			<div>
				<WorkList />
				<WorkList />
				<WorkList />
				<WorkList />
				<WorkList />
			</div>
		</div>
	);
}

function WorkList() {
	return (
		<div>
			Worklist
			<Task></Task>
			<Task></Task>
			<Task></Task>
			<Task></Task>
			<Task></Task>
			<Task></Task>
		</div>
	);
}

function Task() {
	return <div>Task</div>;
}
