/*
 * Copyright (C) 2022 OhMyProgramming <github.com/OhMyProgramming>
 * To-do App
 */

var app = app ? app : {};
app.container  = document.querySelector("app-container");
app.element = [];
app.element.items = app.container.querySelector(".items-list");
app.element.cssTemporary = document.body.querySelector("css-temporary");
app.element.aboveItemsList = app.container.querySelector(".above-items-list");
app.element.addItemButton = app.element.aboveItemsList.querySelector(".add-item button");
app.element.addItemOptions = app.container.querySelector(".add-item-options");
app.element.infoModalChooser = app.container.querySelector(".info-modal-chooser");
app.items = []; /* Items list */
app.storage = window.localStorage; /* All local data is stored here */

/* Initialize all the items from the app.storage.  If no items exist we apply */
/* a default value; either it be an empty array or a zero.  We do this or     */
/* else we introduce unexpected behavior into the app.                        */
app.items = JSON.parse(app.storage.getItem("items"));

/* app.items - Default values */
if (app.items == null || app.items == '') {
    app.items = [];
    app.storage.setItem("items", "[]");
    app.storage.setItem("itemsSize", 0);
}

/* List of template literals that will get applied once the page has loaded.  */
/* These literals are applied on elements containing the template=1 attribute */
/* indicating that it's to be treated by the template engine, any value other */
/* means the element is skipped.  An additional attribute template-html=1 can */
/* be used to apply literals to innerHTML instead of innerText.               */
app.templates = [];

/* --- Predefined app templates */
app.templates.Username = "OhMyProgramming";
app.templates.AppName = "To-do App";
app.templates.AppNamePackage = "com.todo.app";
app.templates.NumberOfTodoItems = Number(app.storage.getItem("itemsSize")); /*dynamic*/
app.templates.NumberOfTodoItemsNoun = '';
app.templates.NumberOfTodoItemsChar = '!';

/* If no items or more than 1 item exists we add a plural noun */
if (app.templates.NumberOfTodoItems > 1 || app.templates.NumberOfTodoItems == 0)
    app.templates.NumberOfTodoItemsNoun = 's';

/* If the item list is empty we tell the user how to add one */
if (app.templates.NumberOfTodoItems == 0)
    app.templates.NumberOfTodoItemsChar = "...";

/* Convert the number to be a bit more fancier */
app.templates.NumberOfTodoItems = app.templates.NumberOfTodoItems.toLocaleString();

/**
 * Generate a Universally Unique Identifier (UUID) by randomly shuffling HEX
 * numbers.
 *
 * @return string
 */
function GenerateUUID() {
    var p1 = p2 = p3 = p4 = p5 = "";
    var ch = "0123456789abcdef";
    var ch_len = 16;

    while (p1.length != 8)
        p1 += ch[Math.floor(Math.random() * ch_len)];

    while (p2.length != 4)
        p2 += ch[Math.floor(Math.random() * ch_len)];

    while (p3.length != 4)
        p3 += ch[Math.floor(Math.random() * ch_len)];

    while (p4.length != 4)
        p4 += ch[Math.floor(Math.random() * ch_len)];

    while (p5.length != 12)
        p5 += ch[Math.floor(Math.random() * ch_len)];

    return p1 + '-' + p2 + '-' + p3 + '-' + p4 + '-' + p5;
}

function strtolower(v) {
    return v.toString().toLowerCase();
}

/* Functions for creating, reading, updating and deleting app data */

/**
 * Match a key's needle inside the haystack
 * @return object reference
 */
function MatchKeyNeedle(haystack, key, needle, return_index = false) {
    if (haystack.length == 0 || needle.length == 0)
        return -1;

    var keys = Object.keys(haystack);

    if (keys.length == 0)
        return -2;

    for (i = 0, j = keys.length; i < j; i++) {
        var item = haystack[i];

        if (typeof item[key] !== "undefined")
            if (strtolower(item[key]) === strtolower(needle))
                if (return_index)
                    return i;
                else
                    return item;
        else
            continue;
    }

    return -1;
}

/**
 * Returns all the values from the array
 * and indexes the array numerically
 */
function ArrayValues(array) {
    var i = 0;
    var n = [];
    var d = array;

    d.forEach(function(value, index) {
        n[i++] = value;
    });

    return n;
}

/**
 * Retrieve an item based on its UUID
 * @return Number | Object
 */
function GetItem(identifier = null, return_index = false) {
    if (identifier == null)
        return app.items;

    identifier = identifier.trim();

    if (identifier.length == 0 || app.items.length == 0)
        return 0;

    var item = MatchKeyNeedle(app.items, "uuid", identifier, return_index);

    /* No items inside haystack */
    if (item == -1)
        return -1;

    /* No item found */
    if (item == -2)
        return -2;

    return item;
}

/**
 * Add an item
 * @return Boolean
 */
function AddItem(item_props = {}) {
    if (item_props.length == 0)
        return;

    /* Generate UUID */
    item_props.uuid = GenerateUUID();

    /* Mark the item as not accepted */
    item_props.accepted = false;

    /* Push item */
    app.items.push(item_props);

    /* Overwrite the item in app.storage */
    app.storage.setItem("items", JSON.stringify(app.items));

    /* Increment size */
    var itemsSize = Number(app.storage.getItem("itemsSize"));
    app.storage.setItem("itemsSize", ++itemsSize);

    /* Generate HTML for the item and append it to the list */
    SpawnItem(item_props.title, item_props.uuid, item_props.accepted);

    return true;
}

/**
 * Remove an item based on its identifier
 * @return Boolean
 */
function RemoveItem(identifier) {
    var item = GetItem(identifier, true);

    if (item > -1)
        delete app.items[item];
    else
        return false;

    app.items = ArrayValues(app.items);

    /* Overwrite the item in app.storage */
    app.storage.setItem("items", JSON.stringify(app.items));

    /* Increment size */
    var itemsSize = Number(app.storage.getItem("itemsSize"));
    app.storage.setItem("itemsSize", --itemsSize);

    return true;
}

/**
 * Accept an item based on its identifier
 * @return Boolean
 */
function AcceptItem(identifier) {
    var item = GetItem(identifier);

    if (0 > item)
        return false;

    item.accepted = !item.accepted;

    /* Overwrite the item in app.storage */
    app.storage.setItem("items", JSON.stringify(app.items));

    return true;
}

/**
 * Append an HTMLElement to the .items-list
 * element through parsing an item object
 *
 * @param title    Title
 * @param uuid     UUID
 * @param accepted Whether the item is accepted or not
 * @return true
 */
function SpawnItem(title = null, uuid = null, accepted = false) {
    //var item = GetItem(identifier);

    if (title == null || title.trim().length == 0)
        return false;

    if (uuid == null || uuid.trim().length == 0)
        return false;

    /* If failed to retrieve the item with the specified uuid, then bail out */
    if (Object.keys(GetItem(uuid)).length == 0)
        return false;

    var html = `
<!-- item -->
<div class="item[[accepted]]" tabindex="1" data-uuid="[[uuid]]">
    <div class="title-contain">
        <p>[[title]]</p>
    </div>
    <div class="action-contain">
        <button class="icon-accept"></button>
        <button class="icon-remove"></button>
        <button class="icon-rename"></button>
    </div>
</div>
`;

    accepted = accepted ? " accepted" : ''; /* Ugly, I know. But it "works" :P */

    html = html.replace("[[uuid]]", uuid);
    html = html.replace("[[title]]", title);
    html = html.replace("[[accepted]]", accepted);

    app.element.items.innerHTML += html;
    return true;
}

/**
 * Loads all the items from app.items into the .items-list element
 */
function LoadListItems() {
    if ((len = app.items.length) > 0) {
        for (let i = 0; i < len; i++) {
            var item = app.items[i];
            SpawnItem(item.title, item.uuid, item.accepted);
        }
    }
}

/**
 * Replace element's innerHTML or innerText by searching for template literals
 * and replacing their occurences.
 *
 * @param html_element  Element affectee
 * @param literals      Array of template literals
 * @param template_html Is the template treated as HTML or Text (if a string is provided, that is used as mutatedData!)
 * @return true
 */
function TemplateEngineAssignElement(html_element = null, literals = [], template_html = false) {
    if (html_element == null || !(html_element instanceof HTMLElement))
        return false;

    if (literals.length == 0)
        return false;

    var el = html_element;
    var mutatedData;
    var template_html_is_string = (typeof template_html != "number" && typeof template_html != "boolean"); /* FIXME */

    if (template_html_is_string)
        mutatedData = template_html.toString();
    else
        mutatedData = [el.innerHTML,el.innerText][+template_html];

    for (let k = 0, l = literals.length; k < l; k++) {
        var literal = literals[k];

        /* If the literal value does not exist in the app.templates we'll just leave it be. As the runtime may define */
        /* it afterwards, and we run TemplateEngineAssignReload() to reassign those values, or TemplateEngineAssign() */
        /* which is a bit more taxing on the cpu cycles as it queries for all elements, instead of those containing   */
        /* "template-reload" attribute.                                                                               */
        if (typeof (literal_data = app.templates[literal]) === "undefined")
            continue;

        mutatedData = mutatedData.replace(
            /* Find */
            "{$" + literal + '}',
            /* Replace */
            literal_data
        );
    }

    if (template_html)
        el.innerHTML = mutatedData;
    else
        el.innerText = mutatedData;

    return true;
}

/**
 * Queries all elements on page containing attributes template=1 and modifies
 * their innerHTML or innerText based on properties described above
 *
 * @param bool force_html (Should force HTML despite missing template-html=1)
 * @return null
 */
function TemplateEngineAssign(force_html = false) {
    force_html = !!force_html; // Convert to boolean

    /* Query all elements containing template attributes with value 1 */
    var els =  document.querySelectorAll('*[template=\"1\"]');

    for (let i = 0, j = els.length; i < j; i++) {
        var el = els[i];

        /* Empty element so skip */
        if (el.innerHTML.length == 0)
            continue;

        var template_reload = el.getAttribute("template-reload") ?? false;
        var template_string = el.getAttribute("template-string") ?? false;

        if (template_reload != false && template_string == false)
            el.setAttribute("template-string", el.innerHTML);

        var template_html = el.getAttribute("template-html") ?? false;

        if (force_html)
            template_html = true;

        /* Extract the list of literals to apply */
        var literals = TemplateEngineExtractLiterals(el.innerHTML);

        /* No literals so skip */
        if (literals.length == 0)
            continue;

        TemplateEngineAssignElement(el, literals, template_html);
    }

    return null;
}

/**
 * Extract literals
 *
 * @param string innerHTML
 * @return array Literals
 */
function TemplateEngineExtractLiterals(input) {
    if (input.length == 0)
        return [];

    var literals = [];

    var keyindex = 0;
    var hasfound = 0;

    for (let i = 0, j = input.length; i < j; i++) {
        var ch_curr = input[i];
        var ch_next = input[i + 1];

        if (hasfound) {
            if (ch_curr != '}') {
                literals[keyindex] += ch_curr;
                continue;
            } else {
                --hasfound;
                ++keyindex;
                continue;
            }
        }

        if (ch_curr == '{') {
            if (ch_next == '$') {
                ++hasfound;
                ++i; /* Step over the '$' */
                literals[keyindex] = ""; /* Initialize key */
                continue;
            }
        }
    }

    return literals;
}

/**
 * Same as TemplateEngineAssign, which goes through all the elements in the
 * website and parses their inner HTML or Text values and queries for template
 * literals to be replaced.  The difference with this function is that it
 * primarily runs on elements that have "template-reload" attribute set to 1.
 *
 * @return true
 */
function TemplateEngineAssignReload() {
    var els =  document.querySelectorAll('*[template-reload]');

    for (let i = 0, j = els.length; i < j; i++) {
        var el = els[i];

        var template_reload = el.getAttribute("template-reload") ?? false;
        var template_string = el.getAttribute("template-string") ?? false;

        /* Empty element so skip */
        if (template_string == false)
            continue;

        if (template_reload != false && template_string == false)
            el.setAttribute("template-string", el.innerHTML);

        /* Extract the list of literals to apply */
        var literals = TemplateEngineExtractLiterals(template_string);

        /* No literals so skip */
        if (literals.length == 0)
            continue;

        TemplateEngineAssignElement(el, literals, template_string);
    }

    return null;
}

/* -------------------------------------------------------------------------- */

/* Initialize all the necessary things, templates, etc */
TemplateEngineAssign();

/* If there are items available, spawn them inside the .items-list */
LoadListItems();

/* Additional UI/UX functions for transitions and such */

/**
 * This function causes the elementTarget to nicely transition its properties
 * from the location properties of the elementA to elementB.  It does this by
 * first enumerating the properties of elementA and elementB and generating
 * appropriate animation code for CSS.  Once the code is generated it is applied
 * to the elementTarget
 *
 * @param elementTarget HTMLElement reference to the affectee
 * @param elementA      Initial properties to be set to the affectee
 * @param elementB      Final properties to be set to the affectee
 * @param miliseconds   The amount of time it will take for animation to run
 * @param elementACSS   Array of CSS properties set at the initial state of A
 * @param elementBCSS   Array of CSS properties set at the final state of B
 * @return Boolean
 */
function SnapElement(
    elementTarget,
    elementA,
    elementB,
    miliseconds = 500,
    elementACSS = [],
    elementBCSS = []
) {
    /* Don't allow SnapElement to be used twice at the same time.      */
    /* Do nothing until setTimeout fires to cleanup the state we're in */
    if (firstSetup = (typeof elementTarget.snapElementState === "undefined"))
        elementTarget.snapElementState = true;

    if (!firstSetup && elementTarget.snapElementState == true)
        return false;

    elementTarget.snapElementState = true;

    var aPos = elementA.getBoundingClientRect();
    var bPos = elementB.getBoundingClientRect();

    var defaultPosition   = getComputedStyle(elementTarget)["position"];
    var defaultTransition = getComputedStyle(elementTarget)["transition"];
    var defaultWidth      = getComputedStyle(elementTarget)["width"];
    var defaultHeight     = getComputedStyle(elementTarget)["height"];

    var animName = "anim_" + GenerateUUID().replace(/-/g, '_');
    var elementACSSstring = elementACSS.join(';');
    var elementBCSSstring = elementBCSS.join(';');
    var animDuration = miliseconds / 1e3;

    var cssTpl = `
[temporary-animation="${animName}_trigger"] {
    animation: ${animName} ${animDuration}s alternate forwards;
}

@keyframes ${animName} {
    0% {
        top: ${aPos.top}px;
        left: ${aPos.left}px;
        width: ${aPos.width}px;
        height: ${aPos.height}px;
        ${elementACSSstring}
    }
    100% {
        top: ${bPos.top}px;
        left: ${bPos.left}px;
        width: ${bPos.width}px;
        height: ${bPos.height}px;
        ${elementBCSSstring}
    }
}
`

    var elStyle = document.createElement("style");
    elStyle.id = animName;
    elStyle.innerHTML = cssTpl;
    app.element.cssTemporary.appendChild(elStyle);

    /* position method */
    elementTarget.style.position = "fixed";

    elementTarget.setAttribute("temporary-animation", animName + "_trigger");
    setTimeout(function() {
        /* Set snapElement state to false */
        elementTarget.snapElementState = false;

        /* Remove attributes and elements */
        elementTarget.removeAttribute("temporary-animation");
        elStyle.remove();

        /* Reset CSS Properties to their defaults */
        elementTarget.style.position = defaultPosition;
    }, miliseconds);
}

/**
 * Action function for renaming an item.
 *
 * @param itemIndex Index of an item returned by GetItem(uuid, true)
 * @param targetElement Target element which initiated the rename item call. This target
 *                      element is used for SnapElement animation.
 */
function actionRenameItem(itemIndex = -1, targetElement = null) {
    /* Could not return an item (or item's index) */
    if (itemIndex == -1)
        return -1;

    /* Could not pinpoint a target element */
    if (targetElement == null || !(targetElement instanceof HTMLElement))
        return -2;

    /* Acquire data about the item */
    var itemUUID = app.items[itemIndex].uuid.toString();
    var itemTitle = app.items[itemIndex].title.toString();

    /* Apply the required data to all the input fields inside .add-item-options */
    app.element.addItemOptions.querySelector("input[name=title]").value = itemTitle;
    app.element.addItemOptions.querySelector("input[name=uuid]").value = itemUUID;
    app.element.addItemOptions.initiatorElement = targetElement;

    app.element.addItemOptions.setAttribute("data-action", "rename-item");

    /* Hide all children elements */
    var childElements = app.element.addItemOptions.querySelectorAll('*');
    var childElementsLen = childElements.length;

    for (let i = 0; i < childElementsLen; i++) {
        var el = childElements[i];
        el.cssDefaultTransition = getComputedStyle(el)["transition"];
        el.style.opacity = "0";
        el.style.transition = "opacity .3s ease";
    }

    app.element.addItemOptions.setAttribute("data-hidden", "0");

    SnapElement(
        app.element.addItemOptions,
        targetElement,
        app.element.addItemOptions,
        400,
        [
            "border-radius: 16px",
            "background: rgba(128, 128, 128, .2)"
        ]
    );

    setTimeout(function() {
        for (let i = 0; i < childElementsLen; i++) {
            var el = childElements[i];
            el.style.opacity = "1";
        }
    }, 300);

    setTimeout(function() {
        for (let i = 0; i < childElementsLen; i++) {
            var el = childElements[i];
            el.style.transition = el.cssDefaultTransition;
        }
    }, 400);

    app.element.addItemOptions.querySelector("input[name=title]").focus();
}

function actionAddItem() {
    app.element.addItemOptions.setAttribute("data-action", "add-item");

    /* Hide all children elements */
    var childElements = app.element.addItemOptions.querySelectorAll('*');
    var childElementsLen = childElements.length;

    for (let i = 0; i < childElementsLen; i++) {
        var el = childElements[i];
        el.cssDefaultTransition = getComputedStyle(el)["transition"];
        el.style.opacity = "0";
        el.style.transition = "opacity .3s ease";
    }

    app.element.addItemOptions.setAttribute("data-hidden", "0");

    SnapElement(
        app.element.addItemOptions,
        app.element.addItemButton,
        app.element.addItemOptions,
        400,
        [
            "border-radius: 16px",
            "background: rgba(128, 128, 128, .2)"
        ]
    );

    setTimeout(function() {
        for (let i = 0; i < childElementsLen; i++) {
            var el = childElements[i];
            el.style.opacity = "1";
        }
    }, 300);

    setTimeout(function() {
        for (let i = 0; i < childElementsLen; i++) {
            var el = childElements[i];
            el.style.transition = el.cssDefaultTransition;
        }
    }, 400);

    app.element.addItemOptions.querySelector("input[name=title]").focus();
}

/* Add event listeners for item actions */

/* Add Item Options / Button / Discard / Event / Click */
app.element.addItemOptions.querySelector("button.action-discard")
                          .addEventListener("click", function(eventObject) {
    eventObject.preventDefault();
    var elParent = this.parentElement.parentElement;
    var dataAction = elParent.getAttribute("data-action");

    function elParentHideChildren() {
        var elParentChildren = elParent.querySelectorAll('*');
        var elParentChildrenLen = elParentChildren.length;

        for (let i = 0; i < elParentChildrenLen; i++) {
            var el = elParentChildren[i];
            el.style.opacity = "0";
        }
    }

    if (dataAction == "null")
        return;

    if (dataAction == "add-item" || dataAction == "rename-item") {
        elParent.setAttribute("data-action", "null");
        elParent.querySelector("input[name=title]").value = '';
        elParent.querySelector("input[name=uuid]").value = '';
        elParentHideChildren();

        /* this is **SOOOO HACKY** but I'm in a hurry.. */
        var initiatorElement = app.element.addItemButton;

        if (dataAction == "rename-item")
            initiatorElement = app.element.addItemOptions.initiatorElement;

        SnapElement(
            app.element.addItemOptions,
            app.element.addItemOptions,
            initiatorElement,
            400,
            [],
            [
                "border-radius: 16px",
                "opacity: 0"
            ]
        );

        setTimeout(function() {
            elParent.setAttribute("data-hidden", "1");
        }, 400);
    }

    elParent.querySelector("p.heading").innerText = "Add items2!"; /* This should be a part of the template */
});

/* Add Item Options / Button / Accept / Event / Click */
app.element.addItemOptions.querySelector("button.action-accept")
                          .addEventListener("click", function(eventObject) {
    eventObject.preventDefault();
    var elParent = this.parentElement.parentElement;
    var dataAction = elParent.getAttribute("data-action");
    var inputData = elParent.querySelector("input[name=title]");
    var itemUUID = elParent.querySelector("input[name=uuid]").value ?? false;

    function elParentHideChildren() {
        var elParentChildren = elParent.querySelectorAll('*');
        var elParentChildrenLen = elParentChildren.length;

        for (let i = 0; i < elParentChildrenLen; i++) {
            var el = elParentChildren[i];
            el.style.opacity = "0";
        }
    }

    if (dataAction == "null")
        return;

    if (dataAction == "add-item") {
        /* Can't accept until there's value inside the input field */
        if (inputData.value.trim().length == 0)
            return;

        /* Add the item */
        AddItem({
            title: inputData.value
        });

        appReloadTemplatesOnAction();

        elParent.setAttribute("data-action", "null");
        elParent.querySelector("input[name=title]").value = "";
        elParentHideChildren();

        SnapElement(
            app.element.addItemOptions,
            app.element.addItemOptions,
            app.element.addItemButton,
            400,
            [],
            [
                "border-radius: 16px",
                "opacity: 0"
            ]
        );

        setTimeout(function() {
            elParent.setAttribute("data-hidden", "1");
        }, 300);
    }

    if (dataAction == "rename-item") {
        if (inputData.value.trim().length == 0)
            return;

        /* The UUID returned is empty (for odd reason) and so we just bail */
        if (itemUUID == false)
            return;

        /* Edit the item */
        var itemIndex = GetItem(itemUUID, true);

        app.items[itemIndex].title = inputData.value.trim();

        /* Overwrite the item in app.storage */
        app.storage.setItem("items", JSON.stringify(app.items));

        /* We can't use appReloadTemplatesOnAction() here due to bad software architecture ;P        */
        /* So instead we just query for the .item that contains the data-uuid same with the itemUUID */
        /* and change it's title value                                                               */

        /* Clear all the items from the list, and reapply them */
        app.element.items.innerHTML = '';
        LoadListItems();

        //app.element.items.querySelector(".item[data-uuid=\"" + itemUUID + "\"] .title-contain p").inner;

        elParent.setAttribute("data-action", "null");
        elParent.querySelector("input[name=title]").value = "";
        elParentHideChildren();

        SnapElement(
            app.element.addItemOptions,
            app.element.addItemOptions,
            app.element.addItemButton,
            400,
            [],
            [
                "border-radius: 16px",
                "opacity: 0"
            ]
        );

        setTimeout(function() {
            elParent.setAttribute("data-hidden", "1");
        }, 300);
    }
});

/* This event listener is gonna handle multiple events at once, for example removal of item objects, as assigning     */
/* each item an event listener is taxing on the memory usage, this way will be more elegant and simplistic for this   */
/* project.                                                                                                           */
document.body.addEventListener("click", function(eventObject) {
    eventObject.preventDefault();
    var target = eventObject.target;

    /* Target must be a button */
    if (target instanceof HTMLButtonElement) {
        /* Is the target's parent an .item, and is it contained within .items-list ? */
        var buttonParent = target.parentElement.parentElement;
        var buttonParentParent = buttonParent.parentElement;

        var buttonParentParentClassAttr = buttonParentParent.getAttribute("class") ?? false;
        var buttonParentClassAttr = buttonParent.getAttribute("class") ?? false;
        var buttonParentUuidAttr = buttonParent.getAttribute("data-uuid") ?? false;

        if (target.parentElement.getAttribute("class") == "add-item") {
            if ((runFunction = target.getAttribute("run-function")) !== null) {    
                if (runFunction == "addItem") {
                    actionAddItem();
                    return;
                }
            }
        }

        if (buttonParentParentClassAttr == false)
            return;

        /* Is the parent's parent an .items-list ? */
        if (buttonParentParentClassAttr.includes("items-list")) {
            if (buttonParentClassAttr == false)
                return;

            /* Is the parent an .item ? */
            if (buttonParentClassAttr.includes("item")) {
                /* Check for UUID presence */
                if (buttonParentUuidAttr == false)
                    return;

                /* Decide what action to take based on the class name of the button */
                var actionName = target.getAttribute("class");

                if (actionName.includes(' '))
                    actionName = actionName.split(' ');
                else
                    actionName = actionName.substr(5);

                if (typeof actionName === "object") {
                    for (let i = 0, j = actionName.length; i < j; i++) {
                        var actionNameValue = actionName[i].toString().toLowerCase();

                        if (actionNameValue.toLowerCase().substr(0, 5) === "icon-") {
                            actionName = actionNameValue.substr(5);
                            return;
                        }
                    }
                }

                if (actionName === "rename") {
                    var itemIndex = GetItem(buttonParentUuidAttr, true);
                    var status = actionRenameItem(itemIndex, target);

                    if (0 > status) {
                        alert("An error occured during actionRenameItem().");
                        return;
                    }

                    return;
                }

                if (actionName === "accept") {
                    /* TODO: When accepting an item, it should turn green */
                    if (buttonParentClassAttr.includes("accepted")) {
                        buttonParent.className = buttonParentClassAttr.replace("accepted", '').trim();
                        AcceptItem(buttonParentUuidAttr);
                        return;
                    }

                    buttonParent.className += " accepted";
                    AcceptItem(buttonParentUuidAttr);
                }

                if (actionName === "remove") { /* Accept acts same as remove, this may change in future */
                    var uuid = buttonParentUuidAttr;
                    /* Remove item based on UUID */
                    RemoveItem(uuid);

                    /* Remove item element */
                    buttonParent.remove();

                    /* Reload templates */
                    appReloadTemplatesOnAction();
                }
            }
        }
    }
});

function appReloadTemplatesOnAction() {
    /* Update template literal values */
    app.templates.NumberOfTodoItems = Number(app.storage.getItem("itemsSize"));

    if (0 > app.templates.NumberOfTodoItems)
        app.templates.NumberOfTodoItems = 0;

    if (app.templates.NumberOfTodoItems > 1 || app.templates.NumberOfTodoItems == 0)
        app.templates.NumberOfTodoItemsNoun = 's';
    else
        app.templates.NumberOfTodoItemsNoun = '';

    if (app.templates.NumberOfTodoItems == 0)
        app.templates.NumberOfTodoItemsChar = "...";
    else
        app.templates.NumberOfTodoItemsChar = "!";

    app.templates.NumberOfTodoItems = app.templates.NumberOfTodoItems.toLocaleString();

    TemplateEngineAssignReload();
}
