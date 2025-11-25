

interface User {
  id: number;
  username: string;
  password: string //(hashed) //
  email:string //unique
  role: Role //select from a list (PM, Staff, LM)
  line_manager?: User //user ID //select name from user list
  start_date: Date //user start date
  end_date: Date //date user left company
  department: string // select from drop down list
}

/**
 * @summary Roles for users, RBAC
 */
type Role = "Admin" | "Staff"

/**
 * @summary Collection of Taskboards
 */
interface Workspace{
  title:string;
  description: string;
  taskBoards:TaskBoard[]
  owner:User; //should be a userID

  asignedUsers:User[];  //The users that are allowed to view/use this workspace
}

/**
 * @summary Collection of tasks
 */
interface TaskBoard{
  
  tasks:Task[]
}
 
/**
 * @summary Task to complete
 */
interface Task {
  
  assignedTo: User; //make a ref to user id
  createdBy:User; //make a ref to user id

  createdAt?:number;
  updatedAt?:number;

  //Date related stuff
  dueDate?:Date; //Could be unset
  completedDate?:Date;
  timeLog:TimeLog;

  completed:boolean;  //Or should we use 
  prioity: Priority;

  //Details
  title:string;
  description?:string;
  tags?:string[];
  comments: Comment[];
}

enum Priority {LOW = 0, MEDIUM = 1, HIGH = 2}

/**
 * @summary Generic comment
 */
interface Comment {
  id:number;
  parentId:number; //Reference to the parent task/item its assigned to
  createdBy:User; //reference to their id instead?
  content:string;
}

/**
 * @summary Time log for tasks
 */
interface TimeLog{
  id:number;
  createAt:Date;
  parentTask:Task;  //id of the task its assigned to

  workDate:Date;  //Date you spend the time on
  timeSpent:number //in seconds    
}

  