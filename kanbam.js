// Função para gerar um id único para cada tarefa
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Função para converter o tempo inserido pelo usuário
function convertTime(input) {
  var totalMinutes = parseInt(input);

  if (totalMinutes >= 480) {
    var days = Math.floor(totalMinutes / 480);
    var remainingMinutes = totalMinutes % 480;
    var remainingHours = Math.floor(remainingMinutes / 60);
    remainingMinutes = remainingMinutes % 60;

    return days + " dia(s), " + remainingHours.toString().padStart(2, '0') + ":" + remainingMinutes.toString().padStart(2, '0');
  } else {
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');
  }
}

// Função para converter o tempo inserido pelo usuário
function convertTime(input) {
  var hours = input.substring(0, 2);
  var minutes = input.substring(2, 4);

  var totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

  if (totalMinutes >= 480) {
    var days = Math.floor(totalMinutes / 480);
    var remainingMinutes = totalMinutes % 480;
    var remainingHours = Math.floor(remainingMinutes / 60);
    remainingMinutes = remainingMinutes % 60;

    return days + " dia(s), " + remainingHours.toString().padStart(2, '0') + ":" + remainingMinutes.toString().padStart(2, '0');
  } else {
    var formattedHours = hours + ":" + minutes;
    return formattedHours;
  }
}

// Função para criar um objeto tarefa a partir dos dados informados pelo usuário
function createTask(name, hours, comment) {
  return {
    id: generateId(),
    name: name,
    hours: convertTime(hours),
    comment: comment,
    status: "todo",
    done: false
  };
}

// Função para criar um elemento HTML para representar uma tarefa na interface
function createTaskElement(task) {
  var taskElement = $("<div></div>").addClass("card");
  var checkbox = $("<input>").attr("type", "checkbox").prop("checked", task.done);
  var name = $("<span></span>").text(task.name);
  var hours = $("<span></span>").text(task.hours);
  var comment = $("<p></p>").text(task.comment);

  // Adiciona os botões de editar e excluir
  var editButton = $("<span></span>").addClass("edit-icon").html('<i class="fas fa-pencil-alt"></i>');
  var deleteButton = $("<span></span>").addClass("delete-icon").html('<i class="fas fa-trash-alt"></i>');

  // Adicionando os eventos de clique
  editButton.on("click", function () {
    var taskId = $(this).closest(".card").attr("data-id");
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });
  })

  deleteButton.on("click", function () {
    // Código de exclusão aqui
  });

  taskElement.append(checkbox, name, hours, comment, editButton, deleteButton);


  taskElement.attr("data-id", task.id);

  return taskElement;
}

// Função para salvar as tarefas no localStorage
function saveTasks(tasks) {
  // Converte o array de tarefas em uma string JSON
  var tasksJSON = JSON.stringify(tasks);

  // Armazena a string JSON no localStorage com a chave "tasks"
  localStorage.setItem("tasks", tasksJSON);
}

// Função para carregar as tarefas do localStorage
function loadTasks() {
  // Obtém a string JSON do localStorage com a chave "tasks"
  var tasksJSON = localStorage.getItem("tasks");

  // Converte a string JSON em um array de tarefas
  var tasks = JSON.parse(tasksJSON);

  // Se não houver tarefas salvas, retorna um array vazio
  if (!tasks) {
    tasks = [];
  }

  // Retorna o array de tarefas
  return tasks;
}

// Função para atualizar os contadores de tarefas na interface
function updateCounters(tasks) {
  // Obtém os elementos HTML dos contadores
  var totalCounter = $("#total-counter");
  var todoCounter = $("#todo-counter");
  var doingCounter = $("#doing-counter");
  var doneCounter = $("#done-counter");

  // Inicializa as variáveis para armazenar os números de cada status
  var total = tasks.length;
  var todo = 0;
  var doing = 0;
  var done = 0;

  // Percorre o array de tarefas e incrementa as variáveis de acordo com o status de cada tarefa
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    if (task.status === "todo") {
      todo++;
    } else if (task.status === "doing") {
      doing++;
    } else if (task.status === "done") {
      done++;
    }
  }

  // Atualiza os elementos HTML dos contadores com os números obtidos
  totalCounter.text(total);
  todoCounter.text(todo);
  doingCounter.text(doing);
  doneCounter.text(done);
}

// Função para renderizar as tarefas na interface
function renderTasks(tasks) {
  // Obtém os elementos HTML das colunas
  var todoColumn = $("#todo-column");
  var doingColumn = $("#doing-column");
  var doneColumn = $("#done-column");

  // Limpa o conteúdo das colunas
  todoColumn.empty();
  doingColumn.empty();
  doneColumn.empty();

  // Percorre o array de tarefas e cria um elemento HTML para cada tarefa
  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    var taskElement = createTaskElement(task);

    // Adiciona o elemento HTML à coluna correspondente ao status da tarefa
    if (task.status === "todo") {
      todoColumn.append(taskElement);
    } else if (task.status === "doing") {
      doingColumn.append(taskElement);
    } else if (task.status === "done") {
      doneColumn.append(taskElement);
    }
  }

  // Atualiza os contadores de tarefas
  updateCounters(tasks);
}

// Função para filtrar as tarefas por status na interface
function filterTasks(status) {
  // Obtém todos os elementos HTML das tarefas
  var taskElements = $(".card");

  // Percorre os elementos HTML das tarefas e verifica se o status corresponde ao filtro selecionado
  taskElements.each(function () {
    var taskElement = $(this);

    // Obtém o id da tarefa do atributo data-id do elemento HTML
    var taskId = taskElement.attr("data-id");

    // Encontra a tarefa correspondente no array de tarefas
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });

    // Se o status da tarefa corresponder ao filtro selecionado, mostra o elemento HTML, senão, esconde-o
    if (task.status === status || status === "all") {
      taskElement.show();
    } else {
      taskElement.hide();
    }
  });
}

// Executa quando o documento estiver pronto
$(document).ready(function () {
  // Carrega as tarefas do localStorage e renderiza na interface
  tasks = loadTasks();
  renderTasks(tasks);

  // Adiciona um evento de input ao campo de comentário
  $("#comment").on("input", function () {
    var charCount = $(this).val().length;
    var remainingChars = 200 - charCount;
    $("#char-count").text(remainingChars + "/200");
  });

  // Adiciona um evento de submit ao formulário
  $("#task-form").submit(function (event) {
    event.preventDefault(); // Adicionei esta linha para prevenir o comportamento padrão do formulário

    var name = $("#name").val();
    var hours = $("#hours").val();
    var comment = $("#comment").val();

    if (name.trim() === "") {
      $("#name-error").text("A definição do nome é obrigatória");
      return;
    } else if (/^\s*$/.test(name)) {
      $("#name-error").text("Você deve inserir um nome válido");
      return;
    } else {
      $("#name-error").text("");
      $("#name")[0].setCustomValidity(""); // Limpa a mensagem de erro
    }

    var task = createTask(name, hours, comment);

    tasks.push(task); // Adiciona a nova tarefa ao array de tarefas
    saveTasks(tasks); // Salva as tarefas no localStorage

    // Define o status da tarefa como "todo"
    task.status = "todo";

    renderTasks(tasks); // Renderiza as tarefas na interface

    // Limpa os campos do formulário
    $("#name").val("");
    $("#hours").val("");
    $("#comment").val("");
  });

  $(".card").on("dragstart", function (event) {
    event.originalEvent.dataTransfer.setData("task-id", $(this).attr("data-id"));
  });

  // Adiciona um evento de dragover às colunas
  $(".column").on("dragover", function (event) {
    event.preventDefault();
  });

  // Adiciona um evento de drop às colunas
  $(".column").on("drop", function (event) {
    event.preventDefault();

    var taskId = event.originalEvent.dataTransfer.getData("task-id");

    var task = tasks.find(function (t) {
      return t.id === taskId;
    });

    if (task) {
      task.status = $(this).attr("id"); // Define o status da tarefa com base na coluna em que foi solta

      // Adicione um evento de clique ao botão de edição
editButton.on("click", function () {
  var taskId = $(this).closest(".card").attr("data-id");
  var task = tasks.find(function (t) {
    return t.id === taskId;
  });

  $("#editName").val(task.name);
  $("#editHours").val(task.hours);
  $("#editComment").val(task.comment);

  $('#editTaskModal').modal('show');

  $('#editTaskForm').off('submit').on('submit', function (e) {
    e.preventDefault();

    task.name = $("#editName").val();
    task.hours = $("#editHours").val();
    task.comment = $("#editComment").val();

    saveTasks(tasks);
    renderTasks(tasks);

    $('#editTaskModal').modal('hide');
  })
})

deleteButton.on("click", function () {
  var taskId = $(this).closest(".card").attr("data-id");
  var task = tasks.find(function (t) {
    return t.id === taskId;
  });

  var confirmDelete = confirm("Você tem certeza que quer excluir essa tarefa? Essa ação será permanente.");

  if (confirmDelete) {
    tasks = tasks.filter(function(t) {
      return t.id !== taskId;
    });

    saveTasks(tasks);
    renderTasks(tasks);
  }
  })

// Abra um modal de confirmação para exclusão
var confirmDelete = confirm("Você tem certeza que quer excluir essa tarefa? Esta ação é permanente.");
if (confirmDelete) {
  tasks = tasks.filter(function (t) {
    return t.id !== taskId;
  });

  saveTasks(tasks);
  renderTasks(tasks);
}

      // Função para editar uma tarefa
      function editTask(event) {
        var taskElement = $(event.target).closest(".card");
        var taskId = taskElement.attr("data-id");
        var task = tasks.find(function (t) {
          return t.id === taskId;
        });
      
        if (task) {
          $("#editName").val(task.name);
          $("#editHours").val(task.hours.replace(/\D/g, '')); // Remove todos os não-dígitos do tempo
          $("#editComment").val(task.comment);
      
          $('#editTaskModal').modal('show');
      
          $('#editTaskForm').off('submit').on('submit', function (e) {
            e.preventDefault();
      
            task.name = $("#editName").val();
            task.hours = convertTime($("#editHours").val());
            task.comment = $("#editComment").val();
      
            saveTasks(tasks);
            renderTasks(tasks);
      
            $('#editTaskModal').modal('hide');
          })
        }
      }
      

// Função para confirmar a exclusão de uma tarefa
function confirmDeleteTask(event) {
  var taskElement = $(event.target).closest(".card");
  var taskId = taskElement.attr("data-id");
  var task = tasks.find(function (t) {
    return t.id === taskId;
  });

  if (task) {
    var confirmDelete = confirm("Você tem certeza que quer excluir essa tarefa? Essa ação será permanente.");

    if (confirmDelete) {
      tasks = tasks.filter(function(t) {
        return t.id !== taskId;
      });

      saveTasks(tasks);
      renderTasks(tasks);
    }
  }
}

    }
  });
});