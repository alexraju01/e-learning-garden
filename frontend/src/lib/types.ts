interface User {
	//CHANGE TO ACCOUNT -> USERS ARE PER WORKSPACE
	id: number;
	displayName: string; //min 3 //max 100 //._numbers allowed
	password: string; //(hashed) //max 255, min 8
	email: string; //unique //max 255 //required
	createdAt: Date;
	role: Role; //select from a list (PM, Staff, LM)	//MOVE TO WORKSPACE USER
}

/**
 * @summary Roles for users, RBAC
 */
type Role = "Owner" | "Admin" | "User";

/**
 * @summary Collection of Taskboards
 */
interface Workspace {
	title: string;
	description: string;
	taskBoards: TaskBoard[];
	owner: User; //should be a userID

	asignedUsers: User[]; //The users that are allowed to view/use this workspace
}

/**
 * @summary Collection of tasks
 */
interface TaskBoard {
	tasks: Task[];
}

/**
 * @summary Task to complete
 */
export interface Task {
	assignedTo: User[]; //make a ref to user id
	createdBy: User; //make a ref to user id

	createdAt?: number;
	updatedAt?: number;

	//Date related stuff
	dueDate?: Date; //Could be unset, CANT BE SET IN PAST
	completedDate?: Date;
	timeLogs: TimeLog[];

	status: TaskStatus; //Or should we use
	prioity: Priority;

	//Details
	title: string; //min 1, Max 100
	description?: string;
	tags?: string[];
	activity: Activity[];
}

export interface SimpleTask {
	assignedTo: User[]; //make a ref to user id
	dueDate?: Date; //Could be unset, CANT BE SET IN PAST
	status: TaskStatus; //Or should we use
	prioity: Priority;
	title: string; //min 1, Max 100
	tags?: string[];
	timeSpend: number; //Sum of time logs
}

export enum Priority {
	LOW = 0,
	MEDIUM = 1,
	HIGH = 2,
}
export enum TaskStatus {
	NOTSTARTED = 0,
	INPROGRESS = 1,
	COMPLETED = 2,
	INREVIEW = 3,
}

/**
 * @summary Generic comment
 */
export interface Activity {
	id: number;
	parentId: number; //Reference to the parent task/item its assigned to
	createdBy: User; //reference to their id instead?
	createdAt: Date;
	content: string;
}

/**
 * @summary Time log for tasks
 */
export interface TimeLog {
	id: number;
	parentTask: Task; //id of the task its assigned to
	createAt: Date;
	createdBy: User;
	workDate: Date; //Date you spend the time on
	timeSpent: number; //in seconds
}
