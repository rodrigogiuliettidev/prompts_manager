const STORAGE_KEY = "prompts_storage"

const state = {
  prompts: [],
  selectedId: null,
}

const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnCopy: document.getElementById("btn-copy"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
}

function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })
  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
  updateAllEditableStates()
}

function attachSidebarHandlers() {
  elements.btnOpen.addEventListener("click", () => {
    elements.sidebar.classList.add("open")
  })

  elements.btnCollapse.addEventListener("click", () => {
    elements.sidebar.classList.remove("open")
  })

  elements.list.addEventListener("click", () => {
    if (window.innerWidth <= 950) {
      elements.sidebar.classList.remove("open")
    }
  })
}

function save() {
  const title = elements.promptTitle.innerHTML.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    return
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)
    if (existingPrompt) {
      existingPrompt.title = title
      existingPrompt.content = content
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }

    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }

  renderList(elements.search.value)
  persist()
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Error saving to localStorage", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log("Error loading from localStorage", error)
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
        <div class="prompt-item-info">
            <span class="prompt-item-title">${prompt.title}</span>
            <span class="prompt-item-description">${prompt.content}</span>
        </div>
        <button class="btn-icon" title="Remover" data-action="remove">
            <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
        </button>
    </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent.innerText.trim()
    return navigator.clipboard.writeText(content)
  } catch (error) {
    console.log("Error copying to clipboard", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", (e) => {
  renderList(e.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  attachSidebarHandlers()
}

init()
