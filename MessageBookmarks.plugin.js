/**
 * @name MessageBookmarks
 * @description Lets you bookmark messages so you can jump to them later.
 * @version 1.0.0
 * @author Kur0
 */

class Menu {
  constructor(id, parentElem) {
//banana

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

  addItem(name, url, loadOnly = false) {
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
      }
    } else if (url == "add") {
      this.contextMenu.appendChild(itemDiv)
      itemDiv.id = "addButton"
      //code for adding bookmark




      itemDiv.onclick = () => {
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
        nameInput.placeholder = "Title here"
        bookmarkDiv.appendChild(nameInput)

        var urlInput = document.createElement("input")
        urlInput.placeholder = "Paste message URL here"
        bookmarkDiv.appendChild(urlInput)

        var button = document.createElement("button")
        button.innerHTML = "Save"
        bookmarkDiv.appendChild(button)

        button.onclick = function () {
          let name = nameInput.value
          let url = urlInput.value
          if (name != "" && url != "") {
            nameInput.value = ''
            urlInput.value = ''
            this.addItem(name, url)
          }
        }.bind(this)


      }



    } else {
      console.log("adding item")
      var correctURL = checkURL(url)
      if (correctURL) {
        this.contextMenu.insertBefore(itemDiv, document.querySelector("#addButton"))
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
///
  open(event) {
    this.contextMenu.classList.add("visible")
    this.contextMenu.style.left = event.screenX.toString() + "px"
    this.contextMenu.style.top = event.screenY.toString() + "px"
  }

  removeAllItems() {
    this.contextMenu.innerHTML = ''
  }

  removeItem(nth) {
    this.contextMenu.querySelector(`:nth-child(${nth + 1})`).remove()
    var data = BdApi.Data.load("MessageBookmarks", "urls")
    data.splice(nth, 1);
    BdApi.Data.save("MessageBookmarks", "urls", data)
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
