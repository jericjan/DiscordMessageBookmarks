/**
 * @name MessageBookmarks
 * @description Lets you bookmark messages so you can jump to them later.
 * @version 1.0.0
 * @author Kur0
 */

class Menu {

  /**
   * creates a Menu object with an `id` and optionally append it under `parentElem`
   * @param {string} id 
   * @param {*} [parentElem]
   */
  constructor(id, parentElem) {    

    /**
     * Append a `div` with the id `idSelector` under a `parent` element, or grab that div if it already exists.
     * @param {HTMLElement} parent 
     * @param {string} idSelector 
     * @returns {HTMLDivElement}
     */
    function appendOrGetExisting(parent, idSelector) {
      if (parent.querySelectorAll("#" + idSelector).length == 0) { //none found
        console.log(`${idSelector} menu doesn't exist under the following element. creating`)
        console.log(parent)
        var contextMenu = document.createElement("div")
        contextMenu.id = idSelector
        parent.appendChild(contextMenu)
        return contextMenu
      } else {
        console.log(`${idSelector} menu alr exist. using it.`)
        return parent.querySelector("#" + idSelector)
      }
    }

    if (typeof parentElem == "undefined") {
      var contextMenu = appendOrGetExisting(document.body, id)
    } else {
      var contextMenu = appendOrGetExisting(parentElem, id)
    }
    console.log("Menu created. here it is")
    console.log(contextMenu)
    this.contextMenu = contextMenu
  }

  /**
   * adds an item to the menu
   * @param {string} name - the name of the item
   * @param {string} url  - the message link it points to 
   * @param {boolean} [loadOnly=false] - if true, will only load the item to the menu and not save to the JSON file
   * @param {number} [placeBeforeNth]  - place item before nth (starts at 0)
   */
  addItem(name, url, loadOnly = false, placeBeforeNth) {
    let itemDiv = document.createElement("div")
    itemDiv.setAttribute("class", "Kur0-item")
    itemDiv.innerHTML = name


    function checkURL(url) {
      var regEx = /\/channels\/\d+\/\d+\/\d+/
      var correctURL = regEx.exec(url)
      correctURL = correctURL ? correctURL[0] : false
      return correctURL
    }

    if (typeof url == "function") {
      this.contextMenu.appendChild(itemDiv)
      itemDiv.onclick = (event) => {
        url()
        event.stopPropagation();
        this.contextMenu.classList.remove("visible")
      }
    } else if (url == "add") {
      this.contextMenu.appendChild(itemDiv)
      itemDiv.id = "addButton"
      //code for adding bookmark




      itemDiv.onclick = () => {
        this.openBookmarkTool()



      }



    } else {
      console.log("adding item")
      var correctURL = checkURL(url)
      if (correctURL) {
        if (placeBeforeNth == undefined) {
          this.contextMenu.insertBefore(itemDiv, document.querySelector("#addButton"))
        } else {
          this.contextMenu.insertBefore(itemDiv, this.contextMenu.querySelector(`:nth-child(${placeBeforeNth + 1})`))
        }
        itemDiv.onclick = () => {
          ZLibrary.DiscordModules.NavigationUtils.transitionTo(correctURL)
        }

        function findNthNum(elem) {
          return [].slice.call(elem.parentElement.childNodes).indexOf(elem)
        }

        itemDiv.oncontextmenu = (e) => {
          var itemMenu = new Menu("Kur0-item-context-menu", itemDiv.parentElement)
          var nthNum = findNthNum(itemDiv)
          itemMenu.removeAllItems()
          itemMenu.addItem("Edit", () => {
            console.log(`edit on ${nthNum}`)
            this.openBookmarkTool("edit", nthNum, name, correctURL)
          })
          itemMenu.addItem("Delete", () => {
            console.log(`delete on ${nthNum}`)
            this.removeItem(nthNum)
          })
          itemMenu.open(e)
        }

        if (loadOnly != true) {


          var savedURLS = BdApi.Data.load("MessageBookmarks", "urls")
          savedURLS = savedURLS ? savedURLS : []
          savedURLS.push([name, correctURL])
          BdApi.Data.save("MessageBookmarks", "urls", savedURLS)
        }

      } else {
        BdApi.alert("Incorrect Message URL!")
      }
    }

  }
  
  /**
   * opens the menu
   * @param {MouseEvent} event 
   */
  open(event) {
    this.contextMenu.classList.add("visible")
    this.contextMenu.style.left = event.screenX.toString() + "px"
    this.contextMenu.style.top = event.screenY.toString() + "px"
  }

  removeAllItems() {
    this.contextMenu.innerHTML = ''
  }

  /**
   * removes a menu item at `nth` index (starting at 0)
   * @param {number} nth 
   */
  removeItem(nth) {
    this.contextMenu.querySelector(`:nth-child(${nth + 1})`).remove()
    var data = BdApi.Data.load("MessageBookmarks", "urls")
    data.splice(nth, 1);
    BdApi.Data.save("MessageBookmarks", "urls", data)
  }

  /**
   * edits a menu item at `nth` (starting at 0)
   * @param {number} nthNum 
   * @param {string} name 
   * @param {string} url 
   */
  editItem(nthNum, name, url) {
    //delete the item, put thing before it    
    this.addItem(name, url, true, nthNum)
    this.contextMenu.querySelector(`:nth-child(${nthNum + 2})`).remove() //2 because we added an item right before this

    //replace item in json
    var data = BdApi.Data.load("MessageBookmarks", "urls")
    data[nthNum] = [name, url]
    BdApi.Data.save("MessageBookmarks", "urls", data)

  }

  /**
   * opens the bookmark tool, used to adding/editing bookmarks
   * @param {('add'|'edit')} mode - the mode to use.
   * @param {number} nthNum - the nth item to edit (starting at 0)
   * @param {string} name - if editing, the bookmark's original name
   * @param {string} url - if editing, the bookmark's original url
   */
  openBookmarkTool(mode = "add", nthNum, name, url) {
    console.log("bookmark tool opened")

    var parent = this.contextMenu
    if (parent.querySelectorAll("#Kur0-bookmarkDiv").length != 0) {
      parent.querySelectorAll("#Kur0-bookmarkDiv").forEach((a) => {
        a.remove()
      })
    }
    var bookmarkDiv = document.createElement("div")
    bookmarkDiv.id = "Kur0-bookmarkDiv"
    parent.appendChild(bookmarkDiv)

    var nameInput = document.createElement("input")
    nameInput.value = name ? name : ""
    nameInput.placeholder = "Title here"
    bookmarkDiv.appendChild(nameInput)

    var urlInput = document.createElement("input")
    urlInput.value = url ? url : ""
    urlInput.placeholder = "Paste message URL here"
    bookmarkDiv.appendChild(urlInput)

    var button = document.createElement("button")
    button.innerHTML = mode == "add" ? "Save" : "EDIT"
    bookmarkDiv.appendChild(button)

    button.onclick = function () {
      let name = nameInput.value
      let url = urlInput.value
      if (name != "" && url != "") {
        nameInput.value = ''
        urlInput.value = ''
        if (mode == "add") {
          this.addItem(name, url)
        } else if (mode == "edit") {
          console.log("le editing")
          console.log(nthNum, name, url)
          this.editItem(nthNum, name, url)
        }

      }
    }.bind(this)

  }

}

module.exports = class MessageBookmarks {

  constructor() {
    this.discordLogo = document.querySelector("[class*='childWrapper']")
    this.openContextMenu = this.openContextMenu.bind(this)
    this.closeContextMenu = this.closeContextMenu.bind(this)
  }


  getContextMenu = () => {
    return document.querySelector("#Kur0-context-menu")
  }

  openContextMenu(event) {
    this.getContextMenu().classList.add("visible")
    this.getContextMenu().style.left = event.clientX.toString() + "px"
    this.getContextMenu().style.top = event.clientY.toString() + "px"
  }

  closeContextMenu(event) {
    if (event.target.offsetParent != this.getContextMenu()) {
      this.getContextMenu().classList.remove("visible")
      document.querySelector("#Kur0-item-context-menu").classList.remove("visible")
      if (document.querySelectorAll("#Kur0-bookmarkDiv").length > 0) {
        document.querySelector("#Kur0-bookmarkDiv").remove()
      }
    }
  }



  start() {

    var contextMenu = new Menu("Kur0-context-menu")


    //code for loading bookmarks here
    var savedURLS = BdApi.Data.load("MessageBookmarks", "urls")
    if (typeof savedURLS != "undefined") {
      for (var x of savedURLS) {
        contextMenu.addItem(x[0], x[1], true) //true means it won't save back to the file 
      }
    }

    contextMenu.addItem("Add New Bookmark", "add")
    var itemMenu = new Menu("Kur0-item-context-menu", contextMenu.contextMenu)



    var style = document.createElement('style');
    style.id = "kur0-context-menu-css"
    style.innerHTML = `
    #Kur0-context-menu, #Kur0-item-context-menu{
      position: fixed;
      background-color: black;
      z-index: 1000000;
      display: none;
      border-radius: 15px;
  }



         #Kur0-context-menu.visible, #Kur0-item-context-menu.visible {
            display:block;
         }

         .Kur0-item {
          color: white;
          margin-bottom: 10px;
          margin-top: 10px;
          margin-left: 5px;
          margin-right: 5px;
          padding: 3px;
      }
       
      .Kur0-item:hover {
        cursor: pointer;
        background-color: #363636;
    }    

    #Kur0-bookmarkDiv {
      display: flex;
      flex-direction: column;
  }


  
      `;
    document.head.appendChild(style);






    this.discordLogo.addEventListener("contextmenu", this.openContextMenu)

    document.querySelector("body").addEventListener("click", this.closeContextMenu)


  }

  stop() {
    console.log("Removing event listeners")
    this.discordLogo.removeEventListener("contextmenu", this.openContextMenu);
    document.querySelector("body").removeEventListener("click", this.closeContextMenu);
    console.log("Removing context menu and css")
    document.querySelectorAll("#kur0-context-menu-css").forEach((e) => { e.remove() })
    document.querySelectorAll("#Kur0-context-menu").forEach((e) => { e.remove() })
    document.querySelectorAll("#Kur0-item-context-menu").forEach((e) => { e.remove() })




  }

}
