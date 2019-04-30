import React from 'react';
import ReactDOM from 'react-dom';


class TodoCreate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            todo: {
                id: props.initialId,
                text: '',
                complete: false
            }
        }

        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleKeyUp(e) {
        if (e.key === 'Enter' && e.target.value.length) {
            this.props.onCreate(this.state.todo);
            this.setState(state => ({todo: {
                id: state.todo.id + 1,
                text: '',
                complete: false
            }}));
        }
    }

    handleChange(e) {
        const text = e.target.value;
        this.setState(state => ({
            todo: {
                ...state.todo,
                text
            }
        }));
    }

    render() {
        return (
            <header className="header">
                <h1>todos</h1>
                <input className="new-todo" placeholder="What needs to be done?" autoFocus value={this.state.todo.text} onKeyUp={this.handleKeyUp} onChange={this.handleChange}/>
            </header>
        );
    }
}


class TodoItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            text: ''
        }

        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    handleDoubleClick() {
        this.setState(state => ({
            editing: true,
            text: this.props.todo.text
        }));
    }

    handleChange(e) {
        const text = e.target.value;
        this.setState(state => ({text}));
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            this.applyUpdate()
        } else if (e.key.slice(0, 3) === "Esc") {
            this.setState(state => ({editing: false}));
        }
    }

    handleBlur(e) {
        this.applyUpdate()
    }

    applyUpdate(value) {
        if (this.state.text) {
            // update
            this.props.updateOne({...this.props.todo, text:this.state.text})
            this.setState(state => ({editing: false}));
        } else {
            // delete
            this.props.destroyOne(this.props.todo.id);
        }
    }

    render() {
        const props = this.props;
        const todo = props.todo;

        if (this.state.editing) {
            return (
                <li className="editing">
                    <input className="edit" value={this.state.text} onKeyUp={this.handleKeyUp} onChange={this.handleChange} onBlur={this.handleBlur} ref={input => { if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }}}/>
                </li>
            );
        }

        return (
            <li className={todo.complete ? "completed" : ""}>
                <input className="toggle" type="checkbox" checked={todo.complete} onChange={e => props.updateOne({...todo, complete:e.target.checked})}/>
                <label onDoubleClick={this.handleDoubleClick}>{todo.text}</label>
                <button className="destroy" onClick={e => props.destroyOne(todo.id)}></button>
            </li>
        );
    }
}


class TodoList extends React.Component {
    render() {
        const props = this.props;

        let todos = props.todos;
        if (props.filter) {
            const complete = props.filter === "completed";
            todos = todos.filter(todo => todo.complete === complete);
        }
        
        return (
            <section className="main">
                <input id="toggle-all" className="toggle-all" type="checkbox" checked={!props.activeCount} onChange={e => props.toggleAll(e.target.checked)}/>
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                    {todos.map(todo => <TodoItem key={todo.id} todo={todo} updateOne={props.updateOne} destroyOne={props.destroyOne}/>)}
                </ul>
            </section>
        );
    }
}


class TodoFilter extends React.Component {
    render() {
        const props = this.props;

        return (
            <footer className="footer">
                <span className="todo-count"><strong>{props.activeCount}</strong> item{props.activeCount !== 1 && "s"} left</span>
                <ul className="filters">
                    <li>
                        <a href="" className={props.filter ? "" : "selected"} onClick={e => {e.preventDefault(); props.setFilter()}}>All</a>
                    </li>
                    <li>
                        <a href="" className={props.filter === "active" ? "selected" : ""} onClick={e => {e.preventDefault(); props.setFilter("active")}}>Active</a>
                    </li>
                    <li>
                        <a href="" className={props.filter === "completed" ? "selected" : ""} onClick={e => {e.preventDefault(); props.setFilter("completed")}}>Completed</a>
                    </li>
                </ul>
                {
                    props.completeCount > 0 && <button className="clear-completed" onClick={props.clearCompleted}>Clear completed</button>
                }
            </footer>
        );
    }
}


class TodoApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            todos: [
                {
                    id: 1,
                    text: "active",
                    complete: false
                },
                {
                    id: 2,
                    text: "complete",
                    complete: true
                }
            ],
            filter: "",
        }

        this.handleCreate = this.handleCreate.bind(this);
        this.toggleAll = this.toggleAll.bind(this);
        this.updateOne = this.updateOne.bind(this);
        this.destroyOne = this.destroyOne.bind(this);
        this.clearCompleted = this.clearCompleted.bind(this);
        this.setFilter = this.setFilter.bind(this);
    }

    getCounts() {
        const todos = this.state.todos;
        const completeCount = todos.reduce((sum, todo) => sum + todo.complete, 0);
        return {
            complete: completeCount,
            active: todos.length - completeCount
        }
    }

    handleCreate(todo) {
        this.setState(state => ({
            todos: [...state.todos, todo],
        }));
    }

    toggleAll(complete) {
        this.setState(state => ({
            todos: state.todos.map(todo => ({...todo, complete})),
        }));
    }

    updateOne(todo) {
        this.setState(state => ({
            todos: state.todos.map(t => t.id === todo.id ? todo : t),
        }));
    }

    destroyOne(id, complete) {
        this.setState(state => ({
            todos: state.todos.filter(todo => (todo.id !== id)),
        }));
    }

    clearCompleted() {
        this.setState(state => ({
            todos: state.todos.filter(todo => !todo.complete),
        }));
    }

    setFilter(filter) {
        this.setState(state => ({filter}));
    }

    render() {
        const state = this.state;
        const counts = this.getCounts();
        return (
            <React.Fragment>
                <TodoCreate onCreate={this.handleCreate} initialId={state.todos.length + 1}/>
                {state.todos.length > 0 && <React.Fragment>
                    <TodoList todos={state.todos} activeCount={counts.active} filter={state.filter} toggleAll={this.toggleAll} updateOne={this.updateOne} destroyOne={this.destroyOne}/>
                    <TodoFilter activeCount={counts.active} completeCount={counts.complete} filter={state.filter} setFilter={this.setFilter} clearCompleted={this.clearCompleted}/>
                </React.Fragment>}
            </React.Fragment>
        );
    }
}

ReactDOM.render(<TodoApp />, document.querySelector('.todoapp'));
