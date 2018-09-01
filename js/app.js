const STORAGE_KEY = "todo-vuejs-2.0";
const todoStorage = {
  fetch: function() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    todos.forEach(function(todo, index) {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save: function(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};

const filters = {
  all: function(todos) {
    return todos;
  },
  active: function(todos) {
    return todos.filter(function(todo) {
      return !todo.completed;
    });
  },
  completed: function(todos) {
    return todos.filter(function(todo) {
      return todo.completed;
    });
  }
};

const app = new Vue({
  el: ".todoapp",
  data: {
    todos: todoStorage.fetch(),
    newTodo: "",
    visibility: "all",
    editedTodo: null
  },
  directives: {
    "todo-focus": function(element, binding) {
      if (binding.value) {
        element.focus();
      }
    }
  },
  watch: {
    todos: {
      handler: function(todos) {
        todoStorage.save(todos);
      },
      deep: true
    }
  },
  filters: {
    pluralize: function(n) {
      return n === 1 ? "item" : "items";
    }
  },
  methods: {
    addTodo: function() {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todos.push({
        id: todoStorage.uid++,
        title: value,
        completed: false
      });
      todoStorage.save(this.todos);
      this.newTodo = "";
    },
    removeTodo: function(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
      todoStorage.save(this.todos);
    },
    removeCompleted: function() {
      this.todos = filters.active(this.todos);
    },
    editTodo: function(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
    doneEdit: function(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      const title = todo.title.trim();
      if (title) {
        todo.title = title;
      } else {
        this.removeTodo(todo);
      }
    },
    cancelEdit: function(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    }
  },
  computed: {
    filteredTodos: function() {
      return filters[this.visibility](this.todos);
    },
    remaining: function() {
      const todos = filters.active(this.todos);
      return todos.length;
    },
    allDone: {
      get: function() {
        return this.remaining === 0;
      },
      set: function(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value;
        });
      }
    }
  }
});

function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, "");
  // console.log(visibility);
  if (filters[visibility]) {
    app.visibility = visibility;
  } else {
    window.location.hash = "";
    app.visibility = "all";
  }
}
window.addEventListener("hashchange", onHashChange);
onHashChange();
