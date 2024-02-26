// Função para gerar um id único para cada tarefa
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

var tasks = [];

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

    var timeString = "";

    if (days > 0) {
      timeString += days + " " + (days === 1 ? "dia" : "dias");
      if (remainingHours > 0) {
        timeString += ", " + remainingHours + " " + (remainingHours === 1 ? "hora" : "horas");
      }
    } else if (remainingHours > 0) {
      timeString += remainingHours + " " + (remainingHours === 1 ? "hora" : "horas");
    }

    if (remainingMinutes > 0) {
      if (timeString !== "") {
        timeString += " e ";
      }
      timeString += remainingMinutes + " " + (remainingMinutes === 1 ? "minuto" : "minutos");
    }

    return timeString;
  } else {
    var formattedHours = hours + " hora";
    if (hours !== "01") {
      formattedHours += "s";
    }
    if (minutes !== "00") {
      formattedHours += " e " + minutes + " minuto" + (minutes !== "01" ? "s" : "");
    }
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

// Função para adicionar uma tarefa
function addTask(name, hours, comment) {
  var task = createTask(name, hours, comment);
  tasks.push(task);

  // Recalcula o percentual de conclusão após adicionar a tarefa
  updateProgressBar();
  saveTasks(tasks);
}

// Função para editar uma tarefa
function editTask(id, name, hours, comment) {
  var task = tasks.find(function (t) {
    return t.id === id;
  });
  if (task) {
    task.name = name;
    task.hours = hours;
    task.comment = comment;
  }
}

// Função para excluir uma tarefa
function deleteTask(id) {
  tasks = tasks.filter(function (t) {
    return t.id !== id;
  });

  // Recalcula o percentual de conclusão após excluir a tarefa
  saveTasks(tasks);
  renderTasks(tasks);
  updateProgressBar();
  $("#deleteTaskModal").modal("hide");
}

// Função para criar um elemento HTML para representar uma tarefa na interface
function createTaskElement(task) {
  var taskElement = $("<div></div>").addClass("card").attr("draggable", "true");
  var checkbox = $("<input>").attr("type", "checkbox").prop("checked", task.done);
  var name = $("<span></span>").text(task.name);
  var hours = $("<span></span>").text(task.hours);
  var comment = $("<p></p>").text(task.comment);

  // Adicione um manipulador de eventos ao checkbox para mover a tarefa para "Concluído" ou "Em andamento"
  checkbox.on("change", function () {
    var taskId = taskElement.attr("data-id");
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });
  
    if (task) {
      if (task.status === "todo" && checkbox.prop("checked")) {
        task.status = "done";
      } else if (task.status === "done" && !checkbox.prop("checked")) {
        task.status = "doing";
      } else if (task.status === "doing" && !checkbox.prop("checked")) {
        task.status = "todo";
      }
  
      task.done = checkbox.prop("checked");
  
      // Salve as tarefas e renderize a interface
      saveTasks(tasks);
      renderTasks(tasks);
      
      // Adicione esta chamada à função updateProgressBar
      updateProgressBar();

    }
  });

  // Adicione esta função para calcular e atualizar o progresso
  function calculateAndUpdateProgress() {
    var totalTasks = tasks.length;
    if (totalTasks === 0) {
      updateProgressBar(0);
      return;
    }
    var completedTasks = tasks.filter(function(task) {
      return task.status === "done";
    }).length;
  
    var percentComplete = (completedTasks / totalTasks) * 100;
    percentComplete = isNaN(percentComplete) ? 0 : percentComplete;
  
    if (percentComplete === 100 && completedTasks > 0) {
      updateProgressBar(100);
    } else {
      updateProgressBar(percentComplete);
    }
  }
  
  function updateProgressBar(percentComplete) {
    var formattedPercent = percentComplete % 1 === 0 ? Math.round(percentComplete) : percentComplete.toFixed(2);
    
    $("#progress-bar").css("width", percentComplete + "%");
    $("#progress-bar").attr("aria-valuenow", percentComplete);
    $("#progress-text").text(formattedPercent + "% Concluído");
  }   

// Modifique a função saveTasks para também salvar o progresso
function saveTasks(tasks) {
  var tasksJSON = JSON.stringify(tasks);
  localStorage.setItem("tasks", tasksJSON);
  calculateAndUpdateProgress(); // Atualiza o progresso ao salvar tarefas
}

// Adicione uma nova função para salvar o progresso no localStorage
function saveProgress(progress) {
  localStorage.setItem("progress", progress);
}

// Adicione uma nova função para carregar o progresso do localStorage
function loadProgress() {
  var progress = localStorage.getItem("progress");
  return progress ? parseFloat(progress) : 0;
}

// Dentro do $(document).ready, após carregar as tarefas, atualize o progresso
tasks = loadTasks();
calculateAndUpdateProgress();
  
  // Ao clicar no checkbox
  checkbox.on("change", function () {
     taskId = taskElement.attr("data-id");
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });
  
    if (task) {
      task.done = checkbox.prop("checked");
  
      if (task.done) {
        task.status = "done";
      } else {
        task.status = "doing";
      }
  
      saveTasks(tasks);
      renderTasks(tasks);
      updateProgressBar(); // Atualiza a barra de progresso
    }
  });

  // Adiciona os botões de editar e excluir
  var editButton = $("<span></span>").addClass("edit-icon").html('<i class="fas fa-pencil-alt"></i>');
  var deleteButton = $("<span></span>").addClass("delete-icon").html('<i class="fas fa-trash-alt"></i>');

  // Adicionando os eventos de clique
  editButton.attr("data-id", task.id);
  deleteButton.attr("data-id", task.id);

  editButton.on("click", function () {
  var taskId = $(this).attr("data-id");
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

  });
});

// No clique do botão de excluir
deleteButton.on("click", function () {
  var taskId = $(this).attr("data-id");

  // No clique do botão de confirmação dentro do modal
  $("#confirmDeleteButton").off().on("click", function () {
    tasks = tasks.filter(function (t) {
      return t.id !== taskId;
    });

    saveTasks(tasks);
    renderTasks(tasks);
    updateProgressBar();

    // Agora, ao invés de fechar manualmente o modal, vamos usar a função 'hide' do Bootstrap
    $('#deleteTaskModal').modal('hide');
  });

  // No clique do botão de cancelar dentro do modal
  $("#cancelDeleteButton").off().on("click", function () {
    $('#deleteTaskModal').modal('hide');
  });

  $("#deleteTaskModal").modal("show");
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
  updateProgressBar();

  window.addEventListener("scroll", function () {
    var whatsappButton = document.querySelector(".anstech-button");
    var scrollPosition = window.scrollY || document.documentElement.scrollTop;
  
    // Ajuste o limite conforme necessário. Este é um exemplo simples.
    if (scrollPosition > 500) {
      whatsappButton.style.display = "block";
    } else {
      whatsappButton.style.display = "none";
    }
  });

  // Adiciona um evento de input ao campo de comentário
  $("#comment").on("input", function () {
    var charCount = $(this).val().length;
    var remainingChars = 400 - charCount;
    $("#char-count").text(remainingChars + "/400");
  });

  // Adiciona um evento de input ao campo de comentário no modal de edição
  $("#editComment").on("input", function () {
    var charCount = $(this).val().length;
    remainingChars = 400 - charCount;
    $("#edit-char-count").text(remainingChars + "/400");
  });  

  $(".column").on("drop", function (event) {
    event.preventDefault();
    var taskId = event.originalEvent.dataTransfer.getData("text/plain");
    var columnId = $(this).attr("id");
  
    // Encontre a tarefa correspondente
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });
  
    if (task) {
      // Obtenha o status atual da tarefa e da coluna de destino
      var currentStatus = task.status;
      var targetStatus = columnId;
  
      console.log(`Tarefa: ${task.name} (ID: ${task.id})`);
      console.log(`Status Atual: ${currentStatus}`);
      console.log(`Coluna de Destino: ${targetStatus}`);
  
      if (
        (currentStatus === "todo" && targetStatus === "doing") ||
        (currentStatus === "doing" && targetStatus === "todo")
      ) {
        // Movimentação permitida de "A fazer" para "Em andamento" e vice-versa
  
        // Mova a tarefa para a nova coluna
        task.status = targetStatus;
        console.log("Movimentação permitida.");
        console.log("Novo Status: " + task.status);
  
        saveTasks(tasks);
        renderTasks(tasks);
      } else {
        // Movimento de tarefa não permitido
        console.log("Movimento de tarefa não permitido.");
        var alertMessage = "Movimento de tarefa não permitido.";
        $('#customAlertMessage').text(alertMessage);
        $('#customAlertModal').modal('show');
      }

      $('#editTaskModal').on('show.bs.modal', function (e) {
        var editHoursInput = $('#editHours');
      
        // Adicione uma função para converter e exibir o tempo quando o modal é exibido
        editHoursInput.on('input', function () {
          var input = editHoursInput.val();
          var convertedTime = convertTime(input);
          editHoursInput.val(convertedTime);
        });
      });      
    }
  });      

    // Delegação de eventos para lidar com o evento "dragstart" nas tarefas (elementos dinâmicos)
    $(document).on("dragstart", ".card", function (event) {
      // Define o ID da tarefa como dado arrastável
      event.originalEvent.dataTransfer.setData("text/plain", $(this).attr("data-id"));
    });
});

// Agora, adicione uma função para lidar com o evento "dragstart" nas tarefas:
$(".card").on("dragstart", function (event) {
  // Define o ID da tarefa como dado arrastável
  event.originalEvent.dataTransfer.setData("text/plain", $(this).attr("data-id"));
});

  // Adiciona um evento de input ao campo de comentário
  $("#comment").on("input", function () {
    var charCount = $(this).val().length;
    var remainingChars = 400 - charCount;
    $("#char-count").text(remainingChars + "/400");
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

    $("#char-count").text("400/400");
  });

  document.getElementById('name').addEventListener('input', function () {
    var remaining = 50 - this.value.length;
    document.getElementById('char-count-name').textContent = remaining + '/50';
});

  document.getElementById('hours').addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
  });
  
  $(".tasks").on("dragstart", ".task", function (event) {
    event.originalEvent.dataTransfer.setData("text/plain", event.target.id);
  });

  // Adiciona um evento de dragover às colunas
  $(".column").on("dragover", function (event) {
    event.preventDefault();
  });

  // Adiciona um evento de drop às colunas
  $(".column").on("drop", function (event) {
    event.preventDefault();
    var taskId = event.originalEvent.dataTransfer.getData("text/plain");
    var columnId = $(this).attr("id");
  
    // Encontre a tarefa correspondente
    var task = tasks.find(function (t) {
      return t.id === taskId;
    });
  
    if (task) {
      // Obtenha o status atual da tarefa e da coluna de destino
      var currentStatus = task.status;
      var targetStatus = columnId;
  
      if (
        (currentStatus === "todo" && targetStatus === "doing") ||
        (currentStatus === "doing" && (targetStatus === "todo" || targetStatus === "done")) ||
        (currentStatus === "done" && targetStatus === "doing")
      ) {
        // Movimentação permitida
        task.status = targetStatus;
        saveTasks(tasks);
        renderTasks(tasks);
      } else {
        // Movimento de tarefa não permitido
        var alertMessage = "Movimento de tarefa não permitido.";
        $('#customAlertMessage').text(alertMessage);
        $('#customAlertModal').modal('show');
      }
    }

    if (task) {
      task.status = $(this).attr("id"); // Define o status da tarefa com base na coluna em que foi solta

    }
  });