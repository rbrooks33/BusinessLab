//Generic data binding
//Example:
//    <div type="div" data-bind-type="quote" data-bind-property="BusinessDescription"></div>
//
//Looks for attributes "data-bind-type" and
//    1.) Matches the "data-bind-property" attribute to a field on the obj
//    2.) Wires appropriate events (based on attribute "type") and sets the obj properties
//
//Params:
//obj: The object which contains the properties 
//dataBindType: Unique keyword that maps the element to the particular object
//    Note: if an element doesn't have an inherant property "type" one must be added.
//    See below for handled types. They usually equate to the type of element (e.g. "div")

Apps.Define([], function () {
    var Me = {

        Obj: null,
        ChangedCallback: null,
        BindingCallback: null,
        BoundCallback: null,
        TableBound: null,
        TableRowBound: null,
        Initialize: function (util) {
            Me.Util = util;
        },
        CountDownBind: {
            count: 0,
            check: function () {
                this.count--;
                if (this.count === 0) {
                    this.calculate();
                }
            },
            calculate: function () {
                if (Me.BindingFinished)
                    Me.BindingFinished();
            }
        },
        BindingFinished: null,
        DataBind: function (obj, key, isCollection, callback, changedCallback, boundCallback) {

            //Me.Obj = obj;
            var boundElements = $("[data-bind-type='" + key + "']");

            $.each(boundElements, function (index, boundElement) {

                Me.CountDownBind.count++;

                try {
                    var propertyName = $(boundElement).attr("data-bind-property"); //For now: required
                    var propertyCollectionName = $(boundElement).attr("data-bind-collection-property"); //Optional if using collection
                    var propertyVisible = $(boundElement).attr("data-bind-property-visible");
                    var propertyCollectionVisible = $(boundElement).attr("data-bind-collection-property-visible");
                    var propertyValueIsInt = $(boundElement).attr("data-bind-int");

                    //Note: "Me.Obj." denotes the binding always takes place with a single object
                    //      Collection binding (e.g. "DynamicColumns[n].Property") also denote
                    //      an object as root.
                    //      What if we want to bind to a collection itself? The notation would be
                    //      "[0].Property" and the eval would be "Me.Obj" + propertyName". The
                    //      reason we want this is to support both templating and binding: with the
                    //      same collection build the html and bind each row. Adding "isCollection" param.

                    //var propertyValue = '';
                    var collectionIndex = 0;
                    //if (propertyCollectionName) {
                    //    propertyValue = isCollection ? eval("Me.Obj" + propertyCollectionName) : eval("Me.Obj." + propertyName);
                    //    let collectionIndexStart = propertyCollectionName.indexOf('[');
                    //    let collectionIndexEnd = propertyCollectionName.indexOf(']');
                    //    collectionIndex = propertyCollectionName.substr(collectionIndexStart + 1, collectionIndexEnd - (collectionIndexStart + 1));
                    //}
                    //else {
                    //}
                    let propertyValue = '';
                    if (propertyCollectionName && propertyCollectionName.length > 0) {
                        propertyValue = eval('obj.' + propertyCollectionName);
                    }
                    else
                        propertyValue = eval("obj." + propertyName);

                    if (typeof propertyValue === 'function')
                        propertyValue = eval("obj." + propertyName + '()');

                    var elementType = boundElement.localName; // Apps.$(boundElement).localName; //.prev()[0].nodeName; // Apps.$(boundElement).attr("type");

                    ////SET VISIBILITY
                    //if (propertyVisible) {
                    //    var isVisible = isCollection ? eval("Me.Obj" + propertyCollectionVisible) : eval("Me.Obj." + propertyVisible);
                    //    if (isVisible)
                    //        Apps.$(boundElement).show();
                    //    else
                    //        Apps.$(boundElement).hide();
                    //}

                    //ELEMENT TYPE
                    if (elementType.toLowerCase() === "text"
                        || elementType.toLowerCase() === "textarea") {

                        //var objCreate = Me.Obj; //Make avail to this scope

                        //SET THE VALUE
                        $(boundElement).val(propertyValue);

                        //WIRE EVENTS
                        $(boundElement).off().on('change keyup paste', function () {

                            //var objWire = objCreate;
                            //isCollection ? eval("objWire" + propertyCollectionName + " = '" + Apps.$(this).val() + "'") : eval("objWire." + propertyName + " = '" + Apps.$(this).val() + "'");
                            eval("obj." + propertyName + " = '" + $(this).val() + "'");
                            //if (propertyValueIsInt && propertyValueIsInt === true)
                            //    eval("objWire." + propertyName + " = '" + parseInt(Apps.$(this).val()) + "'");
                            //else
                            //    eval("objWire." + propertyName + " = '" + Apps.$(this).val() + "'");

                            if (changedCallback)
                                changedCallback($(boundElement), propertyName, $(this).val(), collectionIndex);
                        });

                        //CLICK EVENT ??
                        //Apps.$(boundElement).on('click', function () {
                        //    this.select();
                        //});
                    }
                    else if (elementType.toLowerCase() === "div"
                        || elementType.toLowerCase() === "span") {

                        let contentType = $(boundElement).attr('data-bind-contenttype');

                        if (contentType == 'text' || contentType == undefined) {

                            $(boundElement).text(propertyValue);

                            let boundName = '';
                            let isColl = false;
                            if (propertyCollectionName) {
                                boundName = propertyCollectionName;
                                isColl = true;
                            }
                            else {
                                boundName = propertyName;
                            }


                            //Note: Non-editable elements' change event must be fired programmatically
                            //(e.g. "Apps.$('element').change()")
                            $(boundElement).off().on('change', function () {

                                eval("obj." + boundName + " = '" + $(this).text() + "'");

                                //if (Me.ChangedCallback)
                                //    Me.ChangedCallback(propertyName, Apps.$(this).text());
                            });

                            $(boundElement).off().on('click', function () {
                                if (changedCallback)
                                    changedCallback($(boundElement), boundName, $(this).val(), collectionIndex, isColl, 'click');
                            });
                        }
                        else if (contentType == 'html') {
                            $(boundElement).html(propertyValue);
                            //change?
                        }
                        else if (contentType == 'none') {
                            //Used only as an event sink
                        }
                        else if (contentType == 'bool') {
                            //?
                        }
                    }
                    else if (elementType.toLowerCase() === "select") {
                        //var objCreateSelect = Me.Obj; //Make avail to this scope
                        var isIntCreate = propertyValueIsInt;

                        $(boundElement).val(propertyValue);

                        $(boundElement).off().on('change', function () {

                            //var objWire = objCreateSelect;
                            var isIntWire = isIntCreate;

                            //if (isIntWire)
                            //    isCollection ? eval("obj" + propertyCollectionName + " = " + $(this).val()) : eval("obj." + propertyName + " = " + parseInt($(this).val()));
                            //else
                            //    isCollection ? eval("obj" + propertyCollectionName + " = '" + $(this).val() + "'") : eval("obj." + propertyName + " = '" + $(this).val() + "'");


                            //    if (changedCallback)
                            //        changedCallback($(boundElement), propertyName, $(this).val(), collectionIndex);

                            let boundName = '';
                            let isColl = false;
                            if (propertyCollectionName) {
                                boundName = propertyCollectionName;
                                isColl = true;
                                eval("obj." + propertyCollectionName + " = '" + $(this).val() + "'");
                            }
                            else {
                                boundName = propertyName;
                                eval("obj." + propertyName + " = '" + $(this).val() + "'");
                            }

                            if (changedCallback)
                                changedCallback($(boundElement), boundName, $(this).val(), collectionIndex, isColl);

                        });

                    }
                    //else if (elementType.toLowerCase() === "checkbox") {

                    //    var objCreateCheckbox = Me.Obj; //Make avail to this scope

                    //    Apps.$(boundElement).prop("checked", propertyValue);

                    //    Apps.$(boundElement).on('change', function () {

                    //        var objWire = objCreateCheckbox;

                    //        isCollection ? eval("objWire" + propertyCollectionName + " = " + Apps.$(this).prop("checked")) : eval("objWire." + propertyName + " = " + Apps.$(this).prop("checked"));

                    //        if (changedCallback)
                    //            changedCallback(Apps.$(boundElement), propertyName, Apps.$(this).prop("checked"));

                    //    });

                    //}
                    //Some elements by nature e.g. radio need logic so just let changed event fire
                    else if (elementType.toLowerCase() === "input") {

                        if (boundElement.type === 'text') {
                            //var objCreate = Me.Obj; //Make avail to this scope

                            //SET THE VALUE
                            $(boundElement).val(propertyValue);

                            //WIRE EVENTS
                            $(boundElement).off().on('change keyup paste', function () {

                                //var objWire = objCreate;
                                //isCollection ? eval("obj" + propertyCollectionName + " = '" + $(this).val() + "'") : eval("obj." + propertyName + " = '" + $(this).val() + "'");

                                //if (propertyValueIsInt && propertyValueIsInt === true)
                                //    eval("objWire." + propertyName + " = '" + parseInt(Apps.$(this).val()) + "'");
                                //else
                                //    eval("objWire." + propertyName + " = '" + Apps.$(this).val() + "'");

                                let boundName = '';
                                let isColl = false;
                                if (propertyCollectionName) {
                                    boundName = propertyCollectionName;
                                    isColl = true;
                                    eval("obj." + propertyCollectionName + " = '" + $(this).val() + "'");
                                }
                                else {
                                    boundName = propertyName;
                                    eval("obj." + propertyName + " = '" + $(this).val() + "'");
                                }

                                if (changedCallback)
                                    changedCallback($(boundElement), boundName, $(this).val(), collectionIndex, isColl);

                                //    if (changedCallback)
                                //        changedCallback($(boundElement), propertyName, $(this).val(), collectionIndex);
                            });

                            //CLICK EVENT ??
                            //Apps.$(boundElement).on('click', function () {
                            //    this.select();
                            //});
                        }
                        else if (boundElement.type === 'checkbox') {

                            //var objCreateCheckbox = Me.Obj; //Make avail to this scope

                            $(boundElement).prop("checked", propertyValue);

                            $(boundElement).off().on('change', function () {

                                //var objWire = objCreateCheckbox;

                                //isCollection ? eval("obj" + propertyCollectionName + " = " + $(this).prop("checked")) : eval("obj." + propertyName + " = " + $(this).prop("checked"));

                                let boundName = '';
                                let isColl = false;
                                if (propertyCollectionName) {
                                    boundName = propertyCollectionName;
                                    isColl = true;
                                    eval("obj." + propertyCollectionName + " = " + $(this).prop('checked'));
                                }
                                else {
                                    boundName = propertyName;
                                    eval("obj." + propertyName + " = " + $(this).prop('checked'));
                                }

                                if (changedCallback)
                                    changedCallback($(boundElement), boundName, $(this).prop("checked"), collectionIndex, isColl);

                            });

                        }
                        else if (boundElement.type === 'radio') {
                            $(boundElement).change(function () {
                                if (changedCallback)
                                    changedCallback($(boundElement), propertyName, $(this).prop("checked"), collectionIndex);
                            });
                        }
                        else if (boundElement.type === 'number') {
                            //var objNumber = Me.Obj; //Make avail to this scope
                            $(boundElement).val(propertyValue);
                            $(boundElement).change(function () {
                                //var objWire = objNumber;
                                //isCollection ? eval("obj" + propertyCollectionName + " = '" + $(this).val() + "'") : eval("obj." + propertyName + " = '" + $(this).val() + "'");
                                let boundName = '';
                                let isColl = false;
                                if (propertyCollectionName) {
                                    boundName = propertyCollectionName;
                                    isColl = true;
                                    eval("obj." + propertyCollectionName + " = " + $(this).val());
                                }
                                else {
                                    boundName = propertyName;
                                    eval("obj." + propertyName + " = " + $(this).val());
                                }

                                //HACKZILLA: Handle collections better
                                let collectionIndex = propertyCollectionName.substring(propertyCollectionName.indexOf('[') + 1, propertyCollectionName.indexOf(']'));

                                if (changedCallback)
                                    changedCallback($(boundElement), boundName, $(this).val(), collectionIndex, isColl);
                            });
                        }
                    }
                    else if (elementType.toLowerCase() === "image") {

                        //if (Me.ChangedCallback)
                        //    Me.ChangedCallback(Apps.$(boundElement), propertyName, propertyValue);
                    }
                    else if (elementType.toLowerCase() === "button") {

                    }
                    else if (elementType.toLowerCase() === "span") {
                        $(boundElement).text(propertyValue);
                    }

                    if (Me.BindCallback)
                        Me.BindCallback($(boundElement), propertyName, propertyValue);

                    if (callback)
                        callback($(boundElement), propertyName, propertyValue, collectionIndex);
                }
                catch (err) {
                    Apps.Components.Helpers.HandleException(err);
                }
                Me.CountDownBind.check();
            });
        },
        DataBindControls: function (data, bindType, controlsObject) {
            //Binding and validation.

            if (!Me.ControlTypes)
                Me['ControlTypes'] = [];

            Me.ControlTypes[bindType] = {
                Name: bindType
            };
            Me.ControlTypes[bindType]['Controls'] = [];

            Apps.Bind.DataBind(data, bindType, false,
                function (selector, propertyName, boundValue) {


                    //Bound 
                    try {
                        //let controlTemp = controlsObject;
                        //let propVal = eval('data.' + propertyName);

                        //Object.defineProperty(data, propertyName, {
                        //    get() {
                        //        return propVal;
                        //    },
                        //    set(x) {
                        //        //let hi = 'ya';
                        //        propVal = x;
                        //    }
                        //});

                        let control = eval('controlsObject.' + propertyName);
                        //let control = controlsObject[propertyName]; // eval('Me.Controls.' + propertyName);

                        if (control) {

                            control['Name'] = propertyName;

                            if (!control.PendingMessage)
                                control['PendingMessage'] = '';

                            //if (control) {
                            control.Selector = selector;
                            control.Data = data;
                            if (control.Defaults) {
                                control.Defaults();
                            }
                            if (control.Cleanse) {
                                control.Cleanse(selector.val()); //Cleanses default value of element
                            }
                            if (control.Bound) {
                                control.Bound(propertyName, boundValue);
                            }

                            Me.ValidateControl(control, selector, data); //Fire during bind, accumulates default validation values

                            Me.ControlTypes[bindType].Controls.push(control);
                            //    }
                            //    else {
                            //        Apps.Notify('info', 'Cant find a control for ' + propertyName);
                            //    }
                        }
                    }
                    catch (err) {
                        Apps.Notify('info', 'Problem finding control ' + propertyName);
                        Apps.Components.Helpers.HandleException(err);
                    }
                },
                function (selector, propertyName, newValue, collIndex, isColl, event) {

                    if (!isColl) {

                        //Changed
                        Me.Validate(bindType, controlsObject, selector, data);

                        //let control = controlsObject[propertyName]; // eval('Me.Controls.' + propertyName);
                        let control = eval('controlsObject.' + propertyName); //handles multi-level objects

                        if (control) {

                            control.Selector = selector;
                            control.Data = data;

                            if (control.Cleanse) {
                                control.Cleanse(newValue);
                            }
                            if (control.Changed) {
                                control.Changed(propertyName, newValue);
                            }
                            if (event && event == 'click' && control.Clicked) {
                                control.Clicked(propertyName);
                            }
                        }
                        if (Me.ChangeCallback)
                            Me.ChangeCallback(selector, propertyName, newValue);
                    }
                    else {
                        //TODO: handle collections some way, for now, fire the (now expected) "Controls.Changed"" function
                        if (controlsObject['Changed'])
                            controlsObject.Changed(selector, propertyName, newValue, collIndex, isColl);
                    }
                }
            );
            //Me.Validate(bindType, controlsObject);
        },


        BindProperty: function (component, propertyName) {


            Apps.Bind.DataBind(data, bindType, false,
                function (selector, propertyName, boundValue) {


                    //Bound 
                    try {
                        //let control = controlsObject[propertyName]; // eval('Me.Controls.' + propertyName);
                        let control = eval('controlsObject.' + propertyName);

                        if (control) {

                            control['Name'] = propertyName;

                            if (!control.PendingMessage)
                                control['PendingMessage'] = '';

                            //if (control) {
                            control.Selector = selector;
                            control.Data = data;
                            if (control.Defaults) {
                                control.Defaults();
                            }
                            if (control.Cleanse) {
                                control.Cleanse(selector.val()); //Cleanses default value of element
                            }
                            if (control.Bound) {
                                control.Bound(propertyName, boundValue);
                            }

                            Me.ValidateControl(control, selector, data); //Fire during bind, accumulates default validation values

                            Me.ControlTypes[bindType].Controls.push(control);
                            //    }
                            //    else {
                            //        Apps.Notify('info', 'Cant find a control for ' + propertyName);
                            //    }
                        }
                    }
                    catch (err) {
                        Apps.Notify('info', 'Problem finding control ' + propertyName);
                        Apps.Components.Helpers.HandleException(err);
                    }
                },
                function (selector, propertyName, newValue) {
                    //Changed 
                    Me.Validate(bindType, controlsObject, selector, data);

                    //let control = controlsObject[propertyName]; // eval('Me.Controls.' + propertyName);
                    let control = eval('controlsObject.' + propertyName); //handles multi-level objects

                    if (control) {

                        control.Selector = selector;
                        control.Data = data;

                        if (control.Cleanse) {
                            control.Cleanse(newValue);
                        }
                        if (control.Changed) {
                            control.Changed(propertyName, newValue);
                        }
                    }
                    if (Me.ChangeCallback)
                        Me.ChangeCallback(selector, propertyName, newValue);
                }
            );
            //Me.Validate(bindType, controlsObject);
        },

        ChangeCallback: null,
        Validate: function (bindType, controlsObject, selector, data) {
            var result = true;
            Me.IncompleteControlCount = 0;
            Me.PassedControlCount = 0;
            Me.FailedControlCount = 0;

            //This may replace above
            Me[bindType] = {};
            Me[bindType]['Controls'] = [];

            //Policy
            let elements = $('[data-bind-type="' + bindType + '"]');
            $.each(elements, function (index, el) {
                let prop = $(el).attr('data-bind-property');
                if (prop) {

                    //let policyControl = controlsObject[prop]; // eval('Me.Controls.' + prop);
                    let policyControl = eval('controlsObject.' + prop);
                    if (policyControl != undefined) {
                        Me.ValidateControl(policyControl, policyControl.Selector, data);
                        Me[bindType].Controls.push(policyControl);
                    }
                }
            });

            if (Me.FailedControlCount > 0 || Me.IncompleteControlCount > 0) {
                result = false; //Incomplete would only apply to required fields, all else pass
            }

            return result;
        },
        ValidateControl: function (control, selector, data) {

            //Incomplete is default, on bind make sure property exists so dev doesn't need to check for "property doesnt exist" as opposed to "0"
            if (!Me['PassedControlCount'])
                Me['PassedControlCount'] = 0;

            if (control.Validate) {

                control.Selector = selector;
                control.Data = data;

                let validationState = control.Validate(selector, data);


                if (validationState == 3) {

                    if (!Me.PassedControlCount)
                        Me['PassedControlCount'] = 1;
                    else
                        Me.PassedControlCount++;

                    control.Selector.attr('title', '');

                    control['State'] = 3;
                }
                else if (validationState == 2) {

                    if (!Me.FailedControlCount)
                        Me['FailedControlCount'] = 1;
                    else
                        Me.FailedControlCount++;

                    control.Selector.attr('title', control.FailedMessage);

                    control['State'] = 2;

                }
                else if (validationState == 1 || validationState == undefined) { //default to incomplete

                    if (!Me.IncompleteControlCount)
                        Me['IncompleteControlCount'] = 1;
                    else
                        Me.IncompleteControlCount++;

                    if (control.Selector != undefined)
                        control.Selector.attr('title', control.IncompleteMessage);

                    control['State'] = 1;
                }


            }
            else {

                //default to incomplete
                if (!Me.IncompleteControlCount)
                    Me['IncompleteControlCount'] = 1;
                else
                    Me.IncompleteControlCount++;

                if (control.Selector != undefined)
                    control.Selector.attr('title', control.IncompleteMessage);

                control['State'] = 1;
            }

        },
        BindHTML: function (currentHtml) {

            let resultHtml = currentHtml;
            try {

                currentHtml = Me.BindTemplateIslands(currentHtml);
                currentHtml = Me.BindTemplateModel(currentHtml);

                resultHtml = currentHtml;

            } catch (err) {

                //Apps.Components.Helpers.HandleError(err);
                Apps.Notify('warning', 'HTML binding failure!');
            }

            return resultHtml;
        },
        BindTemplateModel: function (currentHtml) {


            //process component model/controls
            //replaces tag with components model value

            let currentDom = new DOMParser().parseFromString(currentHtml, 'text/html');

            if (currentDom.children[0].children[1].children.length == 1) { //dom inserts doc/html/body

                //let current = $(currentHtml);

                //if (current.length == 1) {

                try {


                    let bindComponents = currentDom.querySelectorAll('[data-bind-component]'); // current.find('[data-bind-component]');

                    if (bindComponents.length > 0) {
                        $.each(bindComponents, function (index, componentTag) {

                            //var prop = $(componentTag).attributes('[data-bind-property]');
                            var componentString = $(componentTag).attr('data-bind-component');
                            var elementType = componentTag.localName.toLowerCase();

                            //let propertyName = $(prop).attr('data-bind-property');
                            if (elementType == 'div' || elementType == 'span') {
                                componentTag.innerText = eval(componentString); // + '.Model.' + propertyName));
                            }
                            else if (elementType == 'input') {
                                componentTag.defaultValue = eval(componentString); // + '.Model.' + propertyName);
                            }
                            else if (elementType == 'option') {
                                componentTag.innerText == eval(componentString);
                            }

                            //    $.each(props, function (tindex, prop) {
                            //    });
                        });
                        currentHtml = currentDom.body.innerHTML; // current.html();
                    }
                }
                catch (err) {
                    let hi = 'ya'; //
                }
            }

            return currentHtml;
        },
        BindModelProperty: function (modelProperty,) {

        },
        BindTemplateIslands: function (currentHtml) {

            var currentDom = new DOMParser().parseFromString(currentHtml, 'text/html');

            if (currentDom.children[0].children[1].children.length == 1) {

                //var current = $(currentHtml);

                //if (current.length == 1) {

                let islandDestinations = currentDom.querySelectorAll('DataIslandDestination'); // current.find('DataIslandDestination');

                if (islandDestinations.length > 0) {

                    $.each(islandDestinations, function (i, dest) {

                        //let dataIsland = dest.id;

                        //Find data island id
                        let dataIslandId = dest.attributes['data-island'].value;

                        //Create a new content div
                        let contentDiv = currentDom.createElement('div'); //
                        contentDiv.id = 'dataIslandInstance_' + dest.id;

                        if (dataIslandId) {

                            //Get island content
                            let dataIslandContents = currentDom.querySelectorAll('#' + dataIslandId); //.html();
                            if (dataIslandContents.length == 1) {

                                let dataIsland = dataIslandContents[0];
                                dataIsland.style.display = 'none';

                                contentDiv.innerHTML = dataIsland.innerHTML;
                                dest.after(contentDiv);
                            }
                        }

                    });
                    currentHtml = currentDom.body.innerHTML;
                }
                //}
            }

            //$.each(bindComponents, function (index, componentTag) {

            //    var props = $(componentTag).children('[data-bind-property]');
            //    var componentString = $(componentTag).attr('data-bind-component');

            //    $.each(props, function (tindex, prop) {
            //        let propertyName = $(prop).attr('data-bind-property');
            //        currentHtml = currentHtml.replace(prop.outerHTML, eval(componentString + '.Model.' + propertyName));
            //    });
            //});

            //var html = ''
            //$.each(current, function (i, c) {
            //    html += $(c).html();
            //});
            return currentHtml;


            //    //let currentHtmlTemp = '<span>' + currentHtml + '</span>'; //for converting html and back

            //    //process data islands
            //    //replaces island "destination" tags with island contents
            //    let currentDom = new DOMParser().parseFromString(currentHtml, 'text/html');
            //    //current = $(current);

            //    let bindIslands = currentDom.querySelectorAll('[data-bind-island-destination]');


            //    //let bindIslands = current.find('[data-bind-island-destination]');
            //    $.each(bindIslands, function (tindex, islandDestination) {

            //        let bindIslandArg = $(islandDestination).attr('data-bind-island-arg');

            //        //Skip if arg is indicated. Looking for arg
            //        if (!bindIslandArg) {

            //            let islandName = $(islandDestination).attr('data-bind-island-destination');
            //            let island = currentDom.querySelectorAll('[data-bind-island=' + islandName + ']');

            //            if (island && island.length == 1) {
            //                $(island).removeProp('hidden');
            //                $(islandDestination).after($(island));

            //                //currentHtml = currentHtml.replace(islandDestination.outerHTML, );
            //            }
            //        }
            //    });
            //    //currentHtml = current.children().html();
            //    //currentHtml = '';
            //    //$.each(current, function (index, element) {
            //    //    currentHtml += element.data;
            //    //})
            //    return currentDom.body.innerHTML; // Html;
        },
        BindDocumentIslands: function () {

            let islandDestinations = document.querySelectorAll('IslandDestination');
            $.each(islandDestinations, function (i, dest) {

                //Hide
                $(dest).hide();

                //Find data island id
                let dataIslandId = dest.attributes['island'].value;

                let documentIslands = $('Island[id="' + dataIslandId + '"]');

                if (documentIslands.length == 1) {
                    dest.innerHTML = documentIslands[0].innerHTML;
                }
                else if (documentIslands.length == 0)
                    Apps.Notify('info', 'Island destination cannot find island "' + dataIslandId + '.');
                else if (documentIslands.length > 1)
                    Apps.Notify('info', 'More than on Island found: "' + dataIslandId + '".');
            });
        },

        BindIslands: function (selector) {

            var currentDom = new DOMParser().parseFromString(selector.html(), 'text/html');

            let islandDestinations = currentDom.querySelectorAll('DataIslandDestination'); // current.find('DataIslandDestination');

            if (islandDestinations.length > 0) {

                $.each(islandDestinations, function (i, dest) {

                    //Find data island id
                    let dataIslandId = dest.attributes['data-island'].value;

                    //Create a new content div
                    let contentDiv = currentDom.createElement('div'); //
                    contentDiv.id = 'dataIslandInstance_' + dest.id;

                    if (dataIslandId) {

                        //Get island content
                        let dataIslandContents = currentDom.querySelectorAll('#' + dataIslandId); //.html();
                        if (dataIslandContents.length == 1) {

                            let dataIsland = dataIslandContents[0];
                            dataIsland.style.display = 'none';

                            contentDiv.innerHTML = dataIsland.innerHTML;
                            dest.after(contentDiv);
                        }
                    }

                });
                currentHtml = currentDom.body.innerHTML;
            }
        },
        BindIsland: function (contentDivId, islandSelector, destinationSelector) {

            if (islandSelector && destinationSelector && islandSelector.length == 1 && destinationSelector.length == 1) {

                //let contentDivString = '<div class="ShippingAccountMethodSelected" id="' + contentDivId + '"></div>';

                //$('.ShippingAccountMethodSelected').detach();

                //let contentDiv = $(contentDivString);

                //destinationSelector.after(contentDiv);
                //contentDiv.html(islandSelector.html());

                destinationSelector.html(islandSelector.html());
            }
        },

        BindModel: function (model, selector) {

            var currentDom = new DOMParser().parseFromString(selector.html(), 'text/html');

            let pageBinds = currentDom.querySelectorAll('DataIslandDestination'); // current.find('DataIslandDestination');

            if (pageBinds.length > 0) {

                $.each(pageBinds, function (i, pageBind) {

                    try {
                        let modelPropertyString = pageBind.attributes['data-bind-model-property'];

                        if (elementType == 'div' || elementType == 'span') {
                            pageBind.innerText = eval(modelPropertyString); // + '.Model.' + propertyName));
                        }
                        else if (elementType == 'input') {
                            pageBind.defaultValue = eval(modelPropertyString); // + '.Model.' + propertyName);
                        }

                    }
                    catch (err) {
                        console.error(err.message);
                    }
                });
            }
        },
        DataBindTable: function (settings) {

            var tableId = settings.tableid;

            ////APPEND TABLE
            //if (Apps.$("#" + settings.parentid).find("#" + tableId).length === 0) //Look for existing table in parent
            //{
            //    if (settings.tabletemplateid) {
            //        //Note: Table in template must have same ID as "settings.tableid"
            //        var tableTemplateHtml = Apps.$("#" + settings.tabletemplateid).html();
            //        var tableTemplate = Apps.$(tableTemplateHtml);
            //        if(tableTemplate.length === 1)
            //            Apps.$("#" + settings.parentid).append(tableTemplate[0].outerHTML); //Put on DOM
            //    }
            //}

            //GET AND CLEAR TABLE
            var table = $("#" + tableId); //Get from DOM
            if (table.length === 0) {
                //get parent template, if any
                var parentTemplate = settings.template.Selector;
                if (parentTemplate.length === 1)
                    table = $('<table id="' + settings.tableid + '" class="table"></table>').appendTo(parentTemplate);
            }

            $.each(table.find("tr"), function (index, child) {
                if (index > 0) //Assumption there is a header row
                    $(child).detach();
            });

            //APPEND ROWS
            $.each(settings.data, function (index, row) {

                var rowHtml = '';

                if (settings.rowbinding) //Used if more than index is needed as template param
                    rowHtml = settings.rowbinding(index, settings.rowtemplateid);
                else
                    rowHtml = Apps.Util.GetHTML(settings.rowtemplateid, [index]);

                var newRow = Apps.$(rowHtml).appendTo(table);

                if (settings.rowbound)
                    settings.rowbound(index, newRow, row); //index, row element and row data

                //if (Me.TableRowBound)
                //    Me.TableRowBound(settings.databindkey, rowHtml); 
            });

            //table.find("td").css("padding", "3px"); //Add padding to td

            //BIND
            Me.DataBind(settings.data, settings.databindkey, true);

            if (settings.drag)
                Me.EnableDrag(settings.drag);

            if (settings.tablebound)
                settings.tablebound(table, settings.data);

            ////SHOW
            //if (settings.show)
            //    table.show();
            //else
            //    table.hide();

            return table;
        },
        BindRow: function (row) {
            var rowstring = '';
            rowstring += '<tr>';
            var props = Object.keys(row);

            $.each(props, function (index, prop) {

                var myrow = row;

                rowstring += '<td>' + row[prop] + '</td>';

            });

            rowstring += '</tr>';
            return rowstring;
        },
        BindThead: function (firstrow) {
            var rowstring = '';
            rowstring += '<tr>';
            var props = Object.keys(firstrow);

            $.each(props, function (index, prop) {

                rowstring += '<th>' + prop + '</th>';

            });

            rowstring += '</tr>';
            return rowstring;
        },
        GetTable: function (settings) {

            /*
            Settings:
            tableid: desired id for table
            data: collection of row data items
            databindkey:
            theadbinding: function
            rowbinding:
            rowbound:
            tablebound:
            */
            var tableId = settings.tableid;

            //GET AND CLEAR TABLE
            var table = $('<table id="' + settings.tableid + '" class="table"></table>');

            if (settings.theadbinding) {
                var theadHtml = settings.theadbinding(settings.data[0]);
                table.append(theadHtml);
            }

            //APPEND ROWS
            //$.each(settings.data, function (index, row) {
            settings.data.forEach(function (row, index) {

                var rowHtml = '';

                if (settings.rowbinding)
                    rowHtml = settings.rowbinding(row, index);

                var newRow = $(rowHtml).appendTo(table);

                if (settings.rowbound)
                    settings.rowbound(index, newRow, row);
            });

            //BIND
            Me.DataBind(settings.data, settings.databindkey, true);

            if (settings.drag)
                Me.EnableDrag(settings.drag);

            if (settings.tablebound)
                settings.tablebound(table, settings.data);

            return table;
        },
        EnableDrag: function (drag) {
            var dragCallback = drag.dragged;

            $("." + drag.rowclass).mousedown(function (e) {
                var tr = $(e.target).closest("TR"), si = tr.index(), sy = e.pageY, b = $(document.body), drag;
                if (si === 0) return;
                b.addClass("grabCursor").css("userSelect", "none");
                tr.addClass("grabbed");
                function move(e) {
                    if (!drag && Math.abs(e.pageY - sy) < 10) return;
                    drag = true;
                    tr.siblings().each(function () {
                        var s = $(this), i = s.index(), y = s.offset().top;
                        if (i > 0 && e.pageY >= y && e.pageY < y + s.outerHeight()) {
                            if (i < tr.index())
                                s.insertAfter(tr);
                            else
                                s.insertBefore(tr);
                            return false;
                        }
                    });
                }
                function up(e) {
                    if (drag && si !== tr.index()) {
                        drag = false;
                        //alert("moved!");

                        dragCallback(si, tr);
                    }
                    $(document).unbind("mousemove", move).unbind("mouseup", up);
                    b.removeClass("grabCursor").css("userSelect", "none");
                    tr.removeClass("grabbed");
                }
                $(document).mousemove(move).mouseup(up);
            });

        },
        ValidationUtilities: {
            SetState: function (stateNumber, selector) {
                /*
                    Assumes parent element is acting as the validation indicator (e.g. color rectangle)
                    1 = incomplete
                    2 = failed
                    3 = passed
                */

                if (selector && selector.length > 0) { //Sometimes validation gets called and element isn't ready
                    var parentElem = selector[0].parentElement;
                    if (!selector[0].style.display) { // only add classes to elements without style="display: none"
                        if ($(parentElem)[0].localName == 'td') {
                            selector = selector.parent();   // selector is a td so move classes to its parent
                        }
                        switch (stateNumber) {
                            case 1: selector.addClass('pending').removeClass('issue').removeClass('passed').parent().addClass('pending').removeClass('issue').removeClass('passed'); break;
                            case 2: selector.addClass('issue').removeClass('pending').removeClass('passed').parent().addClass('issue').removeClass('pending').removeClass('passed'); break;
                            case 3: selector.addClass('passed').removeClass('pending').removeClass('issue').parent().removeClass('issue').removeClass('pending'); break;
                        }
                    }
                }
                return stateNumber;
            },

            Not_Empty_Required: function (selector) {
                let val = 1

                if (selector && selector.length > 0) {
                    if (selector.is('input')) {
                        if (selector.val() && selector.val().length > 0) {
                            val = 3;
                        }
                    }
                    else if (selector.is('span') || selector.is('div')) {
                        if (selector.text() && selector.text().length > 0) {
                            val = 3;
                        }
                    }
                    Me.ValidationUtilities.SetState(val, selector);
                }
                return val;
            },
            Positive_Int_Required: function (selector) {
                let val = 1

                if (selector) {
                    if (selector.is('input')) {
                        if (parseInt(selector.val()) && parseInt(selector.val()) > 0) {
                            val = 3;
                        }
                    }
                    else if (selector.is('span') || selector.is('div')) {
                        if (parseInt(selector.text()) && parseInt(selector.text()) > 0) {
                            val = 3;
                        }
                    }
                    else if (selector.is('select')) {
                        if (parseInt(selector.val()) && parseInt(selector.val()) > 0) {
                            val = 3;
                        }
                    }
                    Me.ValidationUtilities.SetState(val, selector);
                }
                return val;
            },
            SetToZero: function (selector) {
                if (selector) {
                    if (selector.is('input')) {
                        selector.val(0);
                    }
                    else if (selector.is('span') || selector.is('div')) {
                        selector.text(0);
                    }
                }

            },
            SetToOne: function (selector) {
                if (selector) {
                    if (selector.is('input')) {
                        selector.val(1);
                    }
                    else if (selector.is('span') || selector.is('div')) {
                        selector.text(1);
                    }
                }

            }

        }
    }
    return Me;
});