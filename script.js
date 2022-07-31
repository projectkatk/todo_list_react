// a heading that says "To Do List"
// a section that renders the list of tasks
// a form that the user can create a new task
// a list render function to render the tasks
// a component state for storing the input element value, and the tasks array
// an event handler for input change
// an event handler for form submit
// checkStatus and json function to be used in fetch requests later


const checkStatus = (response) => {
    if(response.ok) {
        return response;
    }
    throw new Error('Request was either a 404 or 500');
}

var apiId = "429";

const json = (response) => response.json();

class Task extends React.Component {
    render() {
        const { task, onDelete , onComplete } = this.props;
        const { id, content, completed } = task;

        console.log(task)

        return (
            <div className="row">
                <div className="d-flex justify-content-between align-center w-100 h-auto">
                    <p className="p-2">{content}</p>
                    <div className="d-block">
                        <input className="d-inline-block mx-4" type="checkbox" onChange={() => onComplete(id, completed)} checked={completed}  />
                        <button className="ml-2 d-inline-block btn btn-danger opacity-50" onClick={() => onDelete(id)}>Remove</button>                       
                    </div>                   
                </div>                 
            </div>
        );
    }
}

class ToDoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            new_task: '',
            tasks: [],
            filter: 'all'
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeTask = this.removeTask.bind(this);
        this.toggleComplete = this.toggleComplete.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
    }

    componentDidMount() {
        this.fetchTasks();        
    }

    fetchTasks() {
        fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key="+apiId)
            .then(checkStatus)
            .then(json)
            .then(response => {
                this.setState({
                    tasks: response.tasks
                });
            })
            .catch(error => {
                console.log(error.message)
            })
    }

    removeTask(id) {
        if(!id) {
            return;
        }
        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=${apiId}`, {
            method: 'DELETE',
            mode: "cors",
        })
            .then(checkStatus)
            .then(json)
            .then(data => {
                this.fetchTasks();
            })
            .catch(err => {
                this.setState({
                    err: err.message
                });
                console.log(err)
            })
    }

    toggleComplete(id, completed) {
        if(!id) {
            return;
        }
        const newState = completed ? 'active' : 'complete';
        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_${newState}?api_key=` + apiId, {
            method: 'PUT',
            mode: 'cors',
        })
            .then(checkStatus)
            .then(json)
            .then((data) => {
                this.fetchTasks();
            })
            .catch((err) => {
                this.setState({ 
                    err: err.message 
                });
                console.log(err)
            })
        
    }

    toggleFilter(e) {
        this.setState({
            filter: e.target.name
        })
    }

    handleChange(event) {
        this.setState({
            new_task: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let { new_task } = this.state;
        new_task = new_task.trim();
        if (!new_task) {
            return;
        }
        
        fetch('https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=' + apiId, {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                task: {
                    content: new_task
                }
            }),
        })
        .then(checkStatus)
        .then(json)
        .then(data => {
            this.setState({new_task: ''});
            this.fetchTasks();
        })
        .catch(err => {
            this.setState({ err: err.message });
            console.log(err)
        })
    }

    render() {
        const { new_task, tasks, filter } = this.state;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-9 mx-auto">
                        <h2 className="my-3 text-center fw-bold">To Do List</h2>
                        <form onSubmit={this.handleSubmit} className="form-inline my-4 d-flex gap-4">
                            <input type="text" className="form-control mr-sm-2 mb-2" placeholder="new task" value={new_task} onChange={this.handleChange} />
                            <button type="submit" className="btn btn-primary mb-2">Submit</button>
                        </form>
                        {tasks.length > 0 ? tasks.filter(task => {
                            if(filter === 'all') {
                                return true;
                            } else if (filter === 'active') {
                                return !task.completed;
                            } else {
                                return task.completed;
                            }
                        }).map(task => {
                            return <Task key={task.id} task={task} onDelete={this.removeTask} onComplete={this.toggleComplete} />;
                        }): <p>no tasks here</p>}
                        <div className="d-flex justify-content-between mt-2 bg-light p-2 rounded">
                            <label className="text-secondary">Filter tasks</label>
                            <label className="px-2">
                                <input type="checkbox" name="all" checked={filter === 'all'} onChange={this.toggleFilter} /> All
                            </label>
                            <label className="px-2">
                                <input type="checkbox" name="active" checked={filter === 'active'} onChange={this.toggleFilter} /> Not yet completed
                            </label>
                            <label className="px-2">
                                <input type="checkbox" name="completed" checked={filter === 'completed'} onChange={this.toggleFilter} /> Completed
                            </label>
                        </div>
                        
                       
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <ToDoList />,
    document.getElementById('root')
)