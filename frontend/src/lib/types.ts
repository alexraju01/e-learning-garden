/**
 * @summary Account they log in with
 */
interface Account {
	//CHANGE TO ACCOUNT -> USERS ARE PER WORKSPACE
	id: number;
	displayName: string; //min 3 //max 100 //._numbers allowed
	email: string; //unique //max 255 //required
	password: string; //(hashed) //max 255, min 8	//only shown on signup
	createdAt: Date;
}

/**
 * @summary Users details, per workspace
 */
interface WorkspaceUser {
	workspaceId: number; //make PK
	userId: number;
	role: Role; //Level of perms in that workspace

	id: number; //dont need
}

/**
 * @summary Roles for users, RBAC
 */
type Role = "Owner" | "Admin" | "User";

/**
 * @summary Collection of Taskboards
 */
interface Workspace {
	//metadata
	id: number;
	memberCount: number; //count of user in workspace
	inviteCode: string; //code to join workspace
	createdAt: Date;
	updatedAt: Date;

	//Info
	title: string;
	taskLists: TaskList[]; //ref to all task lists
	myRole: Role; //my users permission level in this workspace

	// Array of all users in the db
	allMembers: {
		id: number; //users id
		displayname: string; //user display name
		email: string; //users email
		role: Role; // users role in the workspace
	};
}

/**
 * @summary Collection of tasks
 */
interface TaskList {
	id: number;	//id of tasklist
	workspaceId: number;	//ref to which workspace its in
	tasks: SimpleTask[]; //Array of task ids
}

/**
 * @summary Task to complete
 */
export interface Task {
	//Metadata
	createdAt?: number;
	updatedAt?: number;

	//Task Data
	assignedTo: Account[]; //make a ref to user id
	createdBy: Account; //make a ref to user id


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
	//metadata
	id: number; //task id pk

	title: string; //min 1, Max 100
	tags?: string[];
	assignedTo: Account[]; //make a ref to user id
	dueDate?: Date; //Could be unset, CANT BE SET IN PAST
	status: TaskStatus; //Or should we use
	prioity: Priority;
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
