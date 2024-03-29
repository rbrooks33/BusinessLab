﻿window.Apps = {
    Name: 'AppsJS',
    Color: 'black',
    Components: [],
    UI: [],
    LocalComponentsReady: function () {
        // $ = jQuery.noConflict(true); //Allows legacy jquery to continue to be used

    },
    Result: function (message, data, callback) {

        var timestamp = new Date().toLocaleTimeString();

        let resultReturn = {
            Success: false,
            Message: message,
            FailedMessages: [],
            SuccessMessages: [],
            Data: data,
            AddSuccess: function (message, data) {

                this.SuccessMessages.push('Success: (' + timestamp + ') ' + message);
                console.info('Success: ' + message);
                if (callback)
                    callback('<span style="color:green;font-weight:bold;">Success:</span> ' + '<span style="font-weight:bold;">' + message + '</span> ' + (data ? data : ''));
            },
            AddFail: function (failmessage, data) {
                this.FailedMessages.push('Fail: (' + timestamp + ') ' + failmessage + '. Data: ' + data);
                console.warn('Fail: ' + failmessage);
                if (callback)
                    callback('<span style="color:red;font-weight:bold;">Fail:</span> ' + '<span style="font-weight:bold;">' + failmessage + '</span> ' + (data ? data : ''));
            },
            Params: [],

        };
        //resultReturn.AddSuccess(message, data);
        return resultReturn;
    },
    Result2: function (message) {


        let resultReturn = {
            Success: false,
            Message: message,
            FailedMessages: [],
            SuccessMessages: [],
            Messages: [],
            AddSuccess: function (message, data) {

                let timestamp = new Date();
                this.SuccessMessages.push({ Timestamp: timestamp, Message: message, Data: (data ? data : '') });
            },
            AddFail: function (failmessage, data) {

                let timestamp = new Date();
                this.FailedMessages.push({ Timestamp: timestamp, Message: failmessage, Data: (data ? data : '') });
            },
            AddMessage: function (message, data) {

                let timestamp = new Date();
                this.Messages.push({ Timestamp: timestamp, Message: message, Data: (data ? data : '') });
            },
            Params: [],
            AddDataParams: function (data) {

                let me = this;
                let dataType = this.isType(data);

                if (dataType == 'object') {

                    $.each(Object.keys(data), function (i, d) {

                        let dType = me.isType(data[d]);
                        let dObj = data[d];

                        if (dType == 'object') {
                            //add child objects' props, for now only single-level object
                            //to aid in passing objects to "Save" e.g.
                            //me.AddDataParams(dObj);
                        }
                        else if (dType == 'array')
                        {
                            //do nothing with arrays, just creating params
                        }
                        else {
                            me.Params.push({ Name: d, Value: dObj.toString() });
                        }

                    });
                }
                else
                    this.FailedMessages.push('Object passed in for data is not of type object.');
            },
            isType: (function (obj) {
                var cache = {};
                var key;
                return obj === null ? 'null' // null
                        : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
                            : obj.nodeType ? 'object' // DOM element
                                : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
                                || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
            })
        };
        //resultReturn.AddSuccess(message, data);
        return resultReturn;
    },
    PreInit: function () {

        //Wait for $
        (async () => {
            console.log("waiting for variable");
            while (!window.hasOwnProperty("$") && !window.hasOwnProperty("jQuery")) // define the condition as you like
                await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("variable is defined");
        })();
        console.log("above code doesn't block main function stack");

        Apps.SetPolyfills();

        Apps['ActiveDeployment'] = {
            "Active": true,
            "Version": 1, //new Date().toLocaleTimeString(), 
            "WebRoot": "https://192.168.168.68",
            "VirtualFolder": "",
            "Port": null,
            "AppsRoot": "Scripts/Apps",
            "Debug": true,
            "Test": false,
            "Authenticated": false,
            "AgencyID": null
        };

        if (Apps.ActiveDeployment.Debug) {
            Apps.ActiveDeployment.WebRoot = 'https://localhost:54322';
            Apps.ActiveDeployment.Version = 10; //don't change so often

        }

        //if (location.pathname.toLowerCase().indexOf('default.aspx') > 0) {
        //    Apps.ActiveDeployment['EnabledComponents'] = [
        //        {
        //            ''
        //        }
        //    ];
        //}

        //if (Apps.ActiveDeployment.Debug) {
        //    Apps['ActiveDeployment'] = {
        //        "Active": true,
        //        "Version": new Date().getDate(),
        //        "WebRoot": "https://localhost",
        //        "VirtualFolder": "",
        //        "Port": "7273",
        //        "AppsRoot": "Scripts/Apps",
        //        "Debug": true,
        //        "Test": false,
        //        "Authenticated": false,
        //        "AgencyID": null
        //    };
        //}

        Apps.LoadDeployment(function () {
            if (Apps.Settings.Debug)
                console.log('active deployment loaded (with auth)');
        });
    },
    //ComponentsReady: function () {
    //    //Single-use hard-coded loader
    //    //Apps.Notify('success', 'Loaded!');
    //},
    Test: function () {
        if (Apps.ActiveDeployment.Test) {
            //if (Apps.Components.Testing)
            //    Apps.Components.Testing.Test(arguments);

        }
    },
    LoadUtil: function (callback) {
        requirejs([Apps.Settings.WebRoot + '/Scripts/Apps/Resources/util.js'], function (util) {
            Apps.Util = util;
            callback();
        });

    },
    Authenticate: function (callback) {

        let webRoot = Apps.ActiveDeployment.WebRoot;
        let port = Apps.ActiveDeployment.Port.length > 0 ? ':' + Apps.ActiveDeployment.Port : '';
        let virtualFolder = Apps.ActiveDeployment.VirtualFolder.length > 0 ? '/' + Apps.ActiveDeployment.VirtualFolder : '';
        let hostUrl = webRoot + port + virtualFolder;

        Apps.WebServiceXML(hostUrl + '/api/Auth/Authenticate', function (resultString) {

            let result = JSON.parse(resultString);
            let authenticationData = result.Data; //Type of Models.Common.AuthenticationData

            sessionStorage.setItem('AuthenticationData', JSON.stringify(authenticationData));

            Apps.ActiveDeployment.Debug = result.Data.Debug;
            Apps.ActiveDeployment.Version = result.Data.Version;
            Apps.Features = authenticationData.Features; //Checked in Controls

            if (callback)
                callback(authenticationData);
        });
    },
    GetAuthenticationData: function () {
        return JSON.parse(sessionStorage.getItem('AuthenticationData'));
    },
    SaveAuthenticationData: function (authenticationData) {
        sessionStorage.setItem('AuthenticationData', JSON.stringify(authenticationData));
    },
    LoadDeployment: function (callback) {
        Apps.LoadSettings();

        if (Apps.Ready)
            Apps.Ready();


        Apps.LoadResources(function () {

            if (Apps.Settings.Debug)
                console.log('all resources loaded');

            Apps.LoadComponentsConfig(function () {

                if (Apps.Settings.Debug)
                    console.log('components config loaded');

                ////Set up error dialog
                Apps.Components.Common.Dialogs.Register('AppsErrorDialog', {
                    title: 'Exception',
                    size: 'full-width',
                    templateid: 'templateMyDialog1',
                    saveclick: function (id) {
                        Apps.Dialogs.Close('AppsErrorDialog');
                    },
                    cancelclick: function (id) {
                        Apps.Dialogs.Close('AppsErrorDialog');
                    }
                });

                if (callback)
                    callback()

            });
        });
    },
    ApplyStringSearchAndReplaceExtension: function () {

        String.prototype.SearchAndReplace = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    },
    LoadSettings: function () {
        Apps.ApplyStringSearchAndReplaceExtension();

        let deployment = Apps.ActiveDeployment;

        Apps['Settings'] = {};
        Apps.Settings["Version"] = deployment.Version;
        Apps.Settings['WebRoot'] = deployment.WebRoot;
        Apps.Settings['Port'] = deployment.Port;
        Apps.Settings['VirtualFolder'] = deployment.VirtualFolder.length > 0 ? '/' + deployment.VirtualFolder : '';
        Apps.Settings['AppsRoot'] = deployment.AppsRoot;
        Apps.Settings['Debug'] = deployment.Debug;
        Apps.Settings['Required'] = deployment.Required;
        Apps.Settings['UseServer'] = deployment.UseServer;
        Apps.Settings.WebRoot = Apps.Settings.WebRoot + (deployment.Port && deployment.Port.length > 0 ? + ':' + deployment.Port : '');
        if (Apps.Settings.Debug)
            console.log('deployment settings applied');
    },
    LoadResources: function (callback) {

        Apps.Download(Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Resources/resources.js?version=' + Apps.Settings.Version, function (response) {

            Apps.Resources = JSON.parse(response);

            var scriptResources = [];
            var nonScriptResources = [];
            var resourceArray = Apps.Resources.Resources; //Object.values(Apps.Resources.Resources);

            for (let x = 0; x < resourceArray.length; x++) {
                if (resourceArray[x].Enabled) {
                    if (resourceArray[x].ModuleType === 'script')
                        scriptResources.push(resourceArray[x]);
                    else
                        nonScriptResources.push(resourceArray[x]);
                }
            }


            if (Apps.Settings.Debug)
                console.log('resources loading begin');

            Apps.LoadScriptResources(scriptResources, function () {

                ///var allNonScriptResources = nonScriptResources;
                //Apps.LoadUtil(function () { //After require, before components. non-optimal
                //Apps.LoadResizer(function () {

                if (Apps.Settings.Debug)
                    console.log('script resources loaded');

                let styleResources = nonScriptResources.filter(function (ns) {
                    return ns.ModuleType === 'style';
                });

                Apps.LoadStyleResources(styleResources);

                let nonStyleResources = nonScriptResources.filter(function (ns) {
                    return ns.ModuleType !== 'style';
                });

                if (nonStyleResources.length > 0) {
                    Apps.LoadNonScriptResources(nonStyleResources, function () {

                        if (Apps.Settings.Debug)
                            console.log('non-script resources loaded');
                        if (callback)
                            callback();
                    });
                }
                else {
                    if (callback)
                        callback();
                }
                //});
                //});
            });
        });
    },

    LoadScriptResources: function (scriptResources, callback) {

        //Earlier doing by order but order doesn't mean anything when 
        //all is asynx :)
        //let orderedResources = Object.values(scriptResources).sort(function (a, b) {
        //    return a.Order - b.Order;
        //});

        //let orderedResources = Apps.Values(scriptResources);

        //Instead, pick some to "LoadFirst", order them and load sync and in order
        let loadFirst = Apps.Filter(scriptResources, function (item, index, fullArray) {
            return item.LoadFirst === true;
        });

        //loadFirst.forEach(function (r, index) {
        //    r.Done = false;
        //});

        for (var firstIndex = 0; firstIndex < loadFirst.length; firstIndex++) {
            loadFirst[firstIndex].Done = false;
        }

        //let loadNext = orderedResources.filter(function (r) {
        //    return r.LoadFirst === false;
        //});

        let loadNext = Apps.Filter(scriptResources, function (item, index, fullArray) {
            return item.LoadFirst === false;
        });

        if (loadFirst.length > 0) {
            Apps.LoadFirstScripts(loadFirst, function () {

                loadNext.forEach(function (r, index) {
                    Apps.LoadResourceScript(r);
                });
            });
        }
        else {

            loadNext.forEach(function (r, index) {
                Apps.LoadResourceScript(r);
            });

        }

        Apps.ScriptResourcesReady = callback;

    },
    LoadResourceScript: function (r) {

        let resourcesFolder = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Resources';

        Apps.CountDownScriptResources.count++;

        Apps.LoadScript(resourcesFolder + '/' + r.FileName + '?version=' + Apps.Settings.Version, function () {

            if (Apps.Settings.Debug)
                console.log('Script: loading next ' + r.FileName);

            Apps.CountDownScriptResources.check();

        });

    },
    Values: function (obj) {
        //var obj = { foo: 'bar', baz: 42 };
        var result = null;
        var values = Object.keys(obj).map(function (e) {
            result = obj[e]; //return obj[e]
        });
        return result;
    },
    Filter: function (myArray, callBack) {
        let newArray = [];
        for (let i = 0; i < myArray.length; i++) {
            let result = callBack(myArray[i], i, myArray);
            if (result) {
                newArray.push(myArray[i]);
            }
        }
        return newArray;
    },
    LoadFirstScripts: function (loadFirsts, callback) {
        //Get first (if any) that have not been loaded
        let notDone = loadFirsts.filter(function (r) {
            return r.Done === false;
        });

        if (notDone.length > 0) {

            notDone[0].Done = true;

            let resourcesFolder = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Resources';
            let fileName = notDone[0].FileName;
            Apps.LoadScript(resourcesFolder + '/' + fileName + '?version=' + Apps.Settings.Version, function () {

                if (Apps.Settings.Debug)
                    console.log('Script: loading first ' + fileName);

                if (fileName == 'require.js') {

                    Apps.Require = requirejsAJS;
                    Apps.Define = window.defineAJS;

                    //    requirejs.config({
                    //        baseUrl: '/Scripts/Apps/Resources',
                    //        map: {
                    //            notify: '/Scripts/Apps/Resources/vanilla-notify',
                    //            util: '/Scripts/Apps/Resources/util'
                    //        }
                    //    });
                }

                Apps.LoadFirstScripts(loadFirsts, callback);
            });

        }
        else
            if (callback)
                callback();
    },
    LoadStyleResources: function (styleResources) {

        var resourcesFolder = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Resources';
        //Style loads sync, do first
        styleResources.forEach(function (s, index) {
            if (Apps.Settings.Debug)
                console.debug('Loading style ' + s.Name);
            Apps.LoadStyle(resourcesFolder + '/' + s.FileName + '?version=' + Apps.Settings.Version);
        });
        if (Apps.Settings.Debug)
            console.debug("All styles loaded.");
    },
    LoadNonScriptResources: function (nonScriptResources, callback) {

        var resourcesFolder = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Resources';

        Apps.NonScriptResourcesReady = callback;

        let orderedResources = nonScriptResources.sort(function (a, b) {
            return a.Order - b.Order;
        });

        orderedResources.forEach(function (r, index) {


            if (r.Enabled) {
                if (r.ModuleType === 'require') {
                    Apps.CountDownNonScriptResources.count++;
                    Apps.Require([resourcesFolder + '/' + r.FileName + '?version=' + Apps.Settings.Version], function (resource) {

                        if (r.ModuleName) {
                            Apps[r.ModuleName] = resource;

                            if (r.ModuleName === 'JQTE')
                                Apps.JQTE = $.fn.jqte; //Don't try this at home
                        }

                        if (Apps.Settings.Debug)
                            console.log('Non-Script: loaded ' + r.FileName + ' (via require)');

                        Apps.CountDownNonScriptResources.check();
                    });
                }
                //else if (r.ModuleType === 'import') {
                //    Apps.CountDownResources.count++;
                //    import(resourcesFolder + '/' + r.FileName)
                //        .then((resource) => {
                //            Apps.CountDownResources.check();
                //        });
                //}
                //else if (r.ModuleType === 'require') {
                //    Apps.CountDownResources.count++;
                //    require([resourcesFolder + '/' + r.FileName], function (obj) {
                //        Apps.CountDownResources.check();
                //    });
                //}
                else if (r.ModuleType === 'script') {
                    Apps.CountDownNonScriptResources.count++;
                    Apps.LoadScript(resourcesFolder + '/' + r.FileName + '?version=' + Apps.Settings.Version, function () {

                        if (Apps.Settings.Debug)
                            console.log('Non-Script: loaded ' + r.FileName + ' (via script)');

                        Apps.CountDownNonScriptResources.check();
                    });
                }
                //else if (r.ModuleType === 'style') {
                //    Apps.CountDownNonScriptResources.count++;
                //    Apps.LoadStyle(resourcesFolder + '/' + r.FileName + '?version=' + Apps.Settings.Version, function () {
                //        Apps.CountDownNonScriptResources.check();
                //    });
                //}
            }
        });


    },
    LoadComponentsConfig: function (callback) {

        Apps.Components = [];

        if (!Apps.Settings.UseServer) {

            if (Apps.Settings.Debug)
                console.log('loading components: auto mode');

            Apps.Download(Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Components/components.js?version=' + Apps.Settings.Version, function (response) {

                var components = JSON.parse(response);
                let componentsFolder = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Components';

                //if (Apps.ActiveDeployment.Test) {
                //    components.Components.push({
                //        "Name": "Testing",
                //        "Version": null,
                //        "Description": null,
                //        "ComponentFolder": null,
                //        "TemplateFolder": null,
                //        "Load": true,
                //        "Initialize": true,
                //        "Color": "blue",
                //        "ModuleType": "require",
                //        "Framework": "default",
                //        "Components": [],
                //        "IsOnDisk": false
                //    });
                //}

                Apps.LoadComponents(null, components.Components, componentsFolder);
            });
        }
        //Apps.ComponentsReady = callback; //just for testing, external app needs to wire this up
    },
    ComponentList: [],
    LoadComponents: function (parentComponent, components, componentsFolder) {

        Apps.CountDownComponents.count++;

        if (components) {


            components.forEach(function (c, index) {

                //if (c.Load && c.ModuleType === 'es6') {

                //    console.log('loading component: ' + c.Name + ' (via ' + c.ModuleType + ')');
                //    Apps.CountDownComponents.count++;
                //    import(componentUrl).then((cObj) => {
                //        Apps.LoadComponent(parentComponent, cObj, c);
                //        Apps.LoadComponents(cObj, c.Components, componentsFolder + '/' + c.Name + '/Components');
                //        Apps.CountDownComponents.check();
                //    });
                //}

                //Make require moduletype default (rb 3/12/2021)
                //Make load==true default (rb 4/19/2021)
                if (
                    (c.Load == null || c.Load == true) &&
                    (c.ModuleType === 'require' || c.ModuleType == null || c.ModuleType == undefined)) {

                    if (Apps.Settings.Debug)
                        console.log('loading component: ' + c.Name);

                    Apps.CountDownComponents.count++;
                    Apps.Require([componentsFolder + '/' + c.Name + '/' + c.Name + '.js?version=' + Apps.Settings.Version], function (cObj) {

                        cObj['Config'] = c;
                        Apps.ComponentList.push(cObj);

                        Apps.LoadComponent(parentComponent, cObj, c, function () {
                            Apps.LoadComponents(cObj, c.Components, componentsFolder + '/' + c.Name); // + '/Components');
                            Apps.CountDownComponents.check();


                            //console.debug('test for ' + c.Name);
                            if (Apps.ActiveDeployment.Test && cObj.Test) {
                                cObj.Test();
                            }

                        });
                    });
                }

            });
        }
        Apps.CountDownComponents.check();
    },
    LoadComponent: function (parentComponent, c, config, callback) {

        if (Object.keys(c).length > 0) {

            if (parentComponent) {
                //Not top (e.g. "Apps.Components.TopComponent.*")
                parentComponent[config.Name] = c;
                c['Parent'] = parentComponent;
                c['Path'] = c.Parent.Path + '/' + config.Name;
            }
            else {
                //Top level (e.g. "Apps.Components.*")
                Apps.Components[config.Name] = c;
                c['Path'] = Apps.Settings.WebRoot + '/' + Apps.Settings.AppsRoot + '/Components/' + config.Name;
            }

            if (typeof c === 'function')
                c = new c();

            //Added "UI" config (rb 3/12/2021)

            if (config.UI && config.UI === true) {

                Apps.CountDownComponents.count++;

                Apps.LoadUI(config.Name, c, function () {

                    Apps.CountDownComponents.check();

                    if (config.Initialize) {
                        c.Initialize(function () {
                            callback();
                        });
                    }
                    else
                        callback();
                });
            }
            else {
                if (config.Initialize) {
                    c.Initialize(function () {
                        callback();
                    });
                }
                else
                    callback();
            }


            //    if (config.Initialize) {

            //        console.log('running intitialize of ' + config.Name);
            //        c.Initialize();

            //        //if (config.Framework === 'react' && config.AutoTranspile) {

            //        //    var input = JSON.stringify(c); // 'const getMessage = () => "Hello World";';
            //        //    var output = Babel.transform(input, { presets: ['es2015'] }).code;
            //        //    //console.log(output);
            //        //    c = JSON.parse(output); //Put back on coll as js
            //        //}

            //        //We might not initialize by default any more??
            //        //Apps.AutoComponents[componentName].Initialize();
            //    }
        }
        else {
            if (Apps.Settings.Debug)
                console.log('Component ' + c.Name + ' not anything.');

            callback();
        }

    },
    LoadUI: function (configName, component, callback) {

        if (!component['UI']) {

            component['UI'] = {};

            Apps.Download(component.Path + '/' + configName + '.html?version=' + Apps.ActiveDeployment.Version, function (data) {

                component['UI'] = new Apps.Template({ id: configName, content: data });
                component['UI'].Load(data);
                component['UI']['Parent'] = component;
                component.UI['Templates'] = [];
                //component.UI['Islands'] = [];

                let templates = $('<div>' + data + '</div>').find('script[type="text/template"]');

                $.each(templates, function (index, template) {
                    component.UI.Templates[template.id] = new Apps.ComponentTemplate({ id: configName + '_' + template.id, content: template.innerHTML });


                });


                Apps.LoadStyle(component.Path + '/' + configName + '.css?version=' + Apps.ActiveDeployment.Version);

                if (callback)
                    callback();
            });
        }
        else {
            if (callback)
                callback();
        }
    },
    LoadStyle: function (filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename + '?version=' + Apps.ActiveDeployment.Version);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    //LoadTemplate: function (name, path, callback) {

    //    if (!Apps.UI[name]) {
    //        Apps.Download(path + '?version=' + Apps.ActiveDeployment.Version, function (data) {

    //            Apps.UI[name] = new Apps.Template({ id: name, content: data });
    //            Apps.UI[name].Load(data);

    //            if (callback)
    //                callback();
    //        });
    //    }
    //    else {
    //        if (callback)
    //            callback();
    //    }
    //    //$.ajax({
    //    //    url: path + '?' + Apps.Settings.Version, type: 'get', datatype: 'html', async: true,
    //    //    success: function (data) {

    //    //        Apps.UI[name] = new Apps.Template({ id: name, content: data });
    //    //        Apps.UI[name].Load(data);

    //    //        if (callback)
    //    //            callback(Apps.UI[name]);
    //    //    }
    //    //});
    //},
    //LoadTemplateAndStyle: function (componentName, callback) {
    //    let componentRoot = Apps.Settings.WebRoot + '/Scripts/Apps/Components/' + componentName + '/' + componentName;
    //    Apps.LoadTemplate(componentName, componentRoot + '.html?ver=' + Apps.Settings.Version, function () {
    //        Apps.LoadStyle(componentRoot + '.css?ver=' + Apps.Settings.Version);

    //        if (callback)
    //            callback();
    //    });
    //},
    //LoadComponentTemplate: function (component, templateName, templateId, argsArray) {
    //    //Assumptions: Template file is dropped

    //    let html = Apps.Util.GetHTML(templateId, argsArray);

    //    if (!component.UI)
    //        component['UI'] = {};

    //    component.UI[templateName] = new Apps.Template({ id: templateName, content: html });
    //    component.UI[templateName].Load(html);
    //},
    //BindTemplate: function (templateId, argsArray) {
    //    var content = $("#" + templateId).html();
    //    if (argsArray) {
    //        content = content.SearchAndReplace.apply(content, argsArray);
    //    }
    //    return content;
    //},
    //Drops all template tags contained in a given file on body (does not check for already loaded)
    DropTemplateFile: function (path, callback) {
        Apps.Download(path + '?version=' + Apps.ActiveDeployment.Version, function (content) {
            //drop all templates in this file, if not already
            $.each($(content), function (index, el) {
                if (!document.getElementById(el.id)) {
                    document.body.appendChild(el);
                }
            });
            if (callback)
                callback();
        });
    },
    //Loads script-tagged template from disk (once) and applies data
    BindTemplate: function (templateId, path, argsArray, callback) {
        var content = '';

        //Download if template not already dropped on page
        if (!document.getElementById(templateId)) {

            Apps.Download(path + '?version=' + Apps.ActiveDeployment.Version, function (content) {

                //drop all templates in this file, if not already
                $.each($(content), function (index, el) {
                    if (!document.getElementById(el.id)) {
                        document.body.appendChild(el);
                    }
                });

                //get bound content for this particular template
                content = $("#" + templateId).html();

                if (argsArray) {
                    content = content.SearchAndReplace.apply(content, argsArray);
                    if (callback)
                        callback(content);
                }
                else {
                    if (callback)
                        callback(content);
                }

            });
        }
        else {
            //get bound content for this particular template
            content = $("#" + templateId).html();

            if (argsArray) {
                content = content.SearchAndReplace.apply(content, argsArray);
                if (callback)
                    callback(content);
            }
            else {
                if (callback)
                    callback(content);
            }

        }
    },
    ApplyArgs : function (html, argsArray) {

        if (argsArray) {
            html = html.SearchAndReplace.apply(html, argsArray);
        }
        return html;
    },

    LoadScript: function (url, callback, fileNameId) {

        if (!document.getElementById(fileNameId)) {
            var script = document.createElement('script');
            script.src = url + '?version=' + Apps.ActiveDeployment.Version;
            if (fileNameId)
                script.id = fileNameId;
            script.onload = callback;
            document.head.appendChild(script);
        }
        else
            callback();
    },
    Download: function (path, callback) {
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    if (callback)
                        callback(this.response);
                }
            };
            xhttp.open('GET', path, true);
            xhttp.send();
        }
        catch (err) {
            console.log('Unable to download ' + path + '. Component files are optional.');
        }
    },
    CountDownScriptResources: {
        count: 0,
        check: function () {
            this.count--;
            if (this.count === 0) {
                this.calculate();
            }
        },
        calculate: function () {
            if (Apps.ScriptResourcesReady)
                Apps.ScriptResourcesReady();
        }
    },
    CountDownNonScriptResources: {
        count: 0,
        check: function () {
            this.count--;
            if (this.count === 0) {
                this.calculate();
            }
        },
        calculate: function () {
            if (Apps.NonScriptResourcesReady)
                Apps.NonScriptResourcesReady();
        }
    },
    CountDownResources: {
        count: 0,
        check: function () {
            this.count--;
            if (this.count === 0) {
                this.calculate();
            }
        },
        calculate: function () {
            if (Apps.ResourcesReady)
                Apps.ResourcesReady();
        }
    },
    CountDownStarts: {
        count: 0,
        check: function () {

            console.log('start component count: ' + this.count);
            this.count--;
            if (this.count === 0) {
                this.calculate();
            }
        },
        calculate: function () {
            if (Apps.AllStarted)
                Apps.AllStarted();
        }
    },
    CountDownComponents: {
        count: 0,
        check: function () {
            //console.log('component count: ' + this.count);
            this.count--;
            if (this.count === 0) {
                this.calculate();
            }
        },
        calculate: function () {

            Apps.LocalComponentsReady();

            if (Apps.ComponentsReady) {

                //temp
                //Apps.Notify('success', 'Ready!');

                Apps.ComponentsReady();

                //Bind
                //Apps.BindComponents();
                //Apps.Bind.BindDocumentIslands();

                //Apps.LoadIslands();
                Apps.LoadDocumentIslands();

                //Start
                //Apps.StartComponents();

                if (Apps.ActiveDeployment.Debug)
                    Apps.Notify('warning', 'Debug configuration is enabled.');
                if (Apps.ActiveDeployment.Test) {
                    Apps.Notify('warning', 'Test mode is enabled. Running tests...');

                    Apps.Require(['/Scripts/Apps/Resources/funcunit.js'], function (funcunit) {

                        Apps.Require(['/Scripts/Apps/Resources/qunit.js'], function (qunit) {

                            QUnit.config.autostart = false;

                            F.speed = 400;
                            //    //Edit/save App
                            //Apps.TestComponents();
                            //    Me.Edit(2);

                        });
                    });

                }
            }
        }
    },
    //StartComponents: function () {

    //    let startComponents = Enumerable.From(Apps.ComponentList).Where(c => c.Start && c.Config.Start && c.Config.Start === true).ToArray();
    //    $.each(startComponents, function (index, component) {
    //         component.Start(function () {
    //            //Apps.CountDownStarts.check();
    //        });
    //       //Apps.StartComponent(component);
    //    });
    //    if(Apps.AllStarted)
    //        Apps.AllStarted();
    //},
    //StartComponent: function (c) {

    //    //Look for island destinations on document

    //    Apps.CountDownStarts.count++;
    //    console.debug('start count: ' + Apps.CountDownStarts.count);

    //    //if (c.Start && c.Config.Start && c.Config.Start === true) {

    //       // console.debug('starting ' + c.Path);

    //    //}
    //    //else
    //    //    Apps.CountDownStarts.check();

    //},
    GetBoundTemplate: function (caller) {
        //Get template whose data-bin-property is '[property]'
        //Apps.LoadBoundTemplates(property);
    },
    LoadBoundTemplates: function (property) {

        $.each(Apps.ComponentList, function (index, component) {

            if (component.UI && component.UI.Templates) {

                let templateNames = Object.keys(component.UI.Templates);

                $.each(templateNames, function (i, t) {


                    Apps.LoadBoundTemplate(component.UI.Templates[t]);

                });
            }

        });

    },
    LoadBoundTemplate: function (template) {


        //Add template islands
        //let thisTemplate = component.UI.Templates[template.id];
        //template['Islands'] = [];

        let templateHtml = template.HTML();

        let templateDom = new DOMParser().parseFromString(templateHtml, 'text/html');

        let islands = templateDom.querySelectorAll('Island');

        $.each(islands, function (i, island) {
            template.Islands.push(island);
        });

    },

    AutoBind: function () {

        let references = Apps.AutoBindReferences;
        let bindElements = $('[data-bind-property]');

        $.each(bindElements, function (i, e) {

            var bindpropname = $(e).attr('data-bind-property'); // "ShippingAddressHTML";

            //Get where not in list or control count is different
            let existing = Enumerable.From(references).Where(r => r.Name == bindpropname).ToArray();

            if (existing.length == 0) {

                //Look for it in every component
                $.each(Apps.ComponentList, function (i, c) {

                    Apps.AutoBindComponent(bindpropname, c);

                });
            }

        });


        //Check all properties for missing bindings
        $.each(Apps.ComponentList, function (i, c) {

            if (c.Model) {
                let props = Object.keys(c.Model);

                $.each(props, function (i, p) {

                    let propBoundCount = Enumerable.From(Apps.AutoBindReferences).Where(ab => ab.Name == p).ToArray().length;
                    if (propBoundCount == 0)
                        console.log(`%cNo auto-bind reference for ${c.Config.Name}.Model.${p}`, 'color:orange');

                });
            }
            else
                console.warn('No model exists for component ' + c.Config.Name);

        });

        $.each(Apps.ComponentList, function (i, c) {

            if (c.Model) {
                let props = Object.keys(c.Model);

                $.each(props, function (i, p) {

                    let propDOMCount = $('[data-bind-property="' + p + '"]').length;
                    if (propDOMCount == 0)
                        console.log(`%cNo corresponding DOM element for ${c.Config.Name}.Model.${p}`, 'color:red');
                });
            }

        });

    },
    AutoBindComponent: function (bindpropname, c) {

        if (c.Model) {
            let modelString = JSON.stringify(c.Model, function (key, value) {
                if (typeof value === 'function') {
                    return value.toString();
                } else {
                    return value;
                }
            });
            let instances = modelString.match(bindpropname);
            if (instances && instances.length == 1) {

                Apps.AutoBindModel(bindpropname, c, true);
                //Save to do only once
                //    }
                //    else
                //        Apps.Notify('info', 'Cannot bind: ' + bindpropname + ' not found in ' + c.Config.Name + '.Model');
                //}
                //else
                //    Apps.Notify('info', 'Cannot bind: ' + bindpropname + ' not found in ' + c.Config.Name + '.Controls');

                //else if (existing.length == 1) {
                //    //Find out if changed
                //    if (references[0].CountrolCount != c.Controls.length)
                //        Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);
                //}
                //    else if (existing.length > 1) {
                //        //Somehow more than one, remove all and start over
                //        Apps.AutoBindReferences = references.filter(r => r.Name);
                //        Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);

                //        Apps.AutoBindReferences.push({ Name: bindpropname, ControlCount: c.Controls.length });
            }
            else if (instances && instances.length > 1)
                console.log('More than one property exists for ' + bindpropname + '!');

        }

    },
    BindComponent: function (c) {
        let props = Object.keys(c);
        $.each(props, function (i, p) {

            let templates = Object.keys(c.UI.Templates);
            $.each(templates, function (i, t) {

                let html = c.UI.Templates[t].HTML();
                let binds = $(html).find('[data-bind-property]');

                $.each(binds, function (i, b) {

                    Apps.AutoBindModel(b.attributes['data-bind-property'].value, c);

                });

            });
        });
    },
    AutoBindModel: function (bindpropname, c, forceBind) {

        let references = Apps.AutoBindReferences;

        try {

            if (c.Controls) {
                //match! Get the element and add data-bind-type (for backward compatibility)
                let elements = document.querySelectorAll('[data-bind-property="' + bindpropname + '"]');

                //if (eval('c.Model.' + bindpropname)) {

                $.each(elements, function (i, e) {

                    //Apply current model values
                    var propertyValue = eval('c.Model.' + bindpropname);
                    var elementType = e.localName.toLowerCase();
                    var contentType = $(e).attr('data-bind-contenttype');

                    if (elementType == 'div' || elementType == 'span') {
                        if (contentType == 'html')
                            e.innerHTML = propertyValue;
                        else if (contentType == 'bool') {
                            //nothing
                        }
                        else
                            e.innerText = propertyValue;
                    }
                    else if (elementType == 'input') {
                        e.defaultValue = propertyValue; // eval(componentString); // + '.Model.' + propertyName);
                    }
                    else if (elementType == 'option') {
                        e.innerText = propertyValue; // eval(componentString);
                    }

                    //Add reference and create binding if not already exists
                    let existing = Enumerable.From(references).Where(r => r.Name == bindpropname).ToArray();

                    if (forceBind == undefined)
                        forceBind = true;

                    if (existing.length == 0 || forceBind) {

                        //Add reference
                        Apps.AutoBindReferences.push({
                            Name: bindpropname,
                            ComponentObject: c,
                            Component: c.Config.Name,
                            ElementType: e.localName,
                            ElementClass: e.className
                        });

                        //For simplicity make type name same as property
                        $(e).attr('data-bind-type', bindpropname);

                        //Bind and validate existing values
                        Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);

                    }
                    else
                        console.debug('Found ' + existing.length + ' data-bind-property ' + bindpropname + ' in ' + c.Config.Name);
                    //});

                    //    $(e).attr('data-bind-type', bindpropname); //For simplicity make type name same as property

                    //    Apps.AutoBindReferences.push({
                    //        Name: bindpropname,
                    //        Component: c.Config.Name,
                    //        ElementType: e.localName,
                    //        ElementClass: e.className
                    //    });

                    //    //Bind
                    //    Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);

                    //    //    if (e.localName == 'script') {
                    //    //        //Bind the templates contents also
                    //    //        Apps.AutoBindContents();
                    //    //    }
                });

                //Bind (if control property exists)
                //if (eval('c.Controls.' + bindpropname))
                //{
                //    if (eval('c.Controls.' + bindpropname)) {
            }
            //    }
            //    else
            //        console.debug('Component ' + c.Config.Name + ' Controls obj not found while doing auto-bind.');
        }
        catch (err) {
            //ignore: usually because eval did not find model property which happens when similar
            //Apps.Components.Helpers.HandleException(err);
            console.debug('Did not find: "' + c.Config.Name + '.Model.' + bindpropname + '"');
        }

    },
    OpenDialog: function (component, id, title, content, topbuttons, bottombuttons, cancelbutton) {

        Apps.Components.Helpers.Dialogs.CloseAll();

        Apps.Components.Helpers.Dialogs.Register(id, {
            title: title,
            topbuttons: topbuttons,
            buttons: bottombuttons,
            cancelbutton: cancelbutton
        });

        Apps.Components.Helpers.Dialogs.Content(id, content);
        Apps.Components.Helpers.Dialogs.Open(id);

        let contentSelector = $('#' + id).find('.dialog-body');
        Apps.BindHTML(contentSelector, component);
    },
    GetTemplateHTML: function (templateId) {
        return $('script[id="' + templateId + '"]').html();
    },
    MoveHTMLx: function (sourceSelector, destinationSelector) {
        Apps.GetMoveBindSource(sourceId, destinationId, null, true);
    },
    BindHTML: function (selector, c) {

        //let references = Apps.AutoBindReferences;
        let innerElements = selector.find('[data-bind-property], [data-bind-collection-property]');

        $.each(innerElements, function (i, e) {


            let bindpropname = '';
            var propertyName = $(e).attr('data-bind-property'); // "ShippingAddressHTML";
            var collectionName = $(e).attr('data-bind-collection-property');

            let isColl = false;
            if (collectionName) {
                bindpropname = collectionName;
                isColl = true;
            }
            else {
                bindpropname = propertyName;
            }

            try {
                if (c.Model) {

                    //Apply current model values
                    var propertyValue = eval('c.Model.' + bindpropname);
                    var elementType = e.localName ? e.localName.toLowerCase() : '[no local name]';
                    var contentType = $(e).attr('data-bind-contenttype');

                    if (elementType == 'div' || elementType == 'span') {
                        if (contentType == 'html')
                            e.innerHTML = propertyValue;
                        else if (contentType == 'text')
                            e.innerText = propertyValue;
                        else if (contentType == 'bool' || contentType == 'none') {
                            //nada
                        }
                        else
                            e.innerText = propertyValue; //default to text
                    }
                    else if (elementType == 'input') {
                        e.defaultValue = propertyValue; // eval(componentString); // + '.Model.' + propertyName);
                    }
                    else if (elementType == 'option') {
                        e.innerText = propertyValue; // eval(componentString);
                    }
                    else if (elementType == 'select') {
                        $(e).val(propertyValue);
                    }
                    //Add reference and create binding if not already exists
                    //let existing = Enumerable.From(references).Where(r => r.Name == bindpropname).ToArray();

                    //if (existing.length == 0) {

                        ////Add reference
                        //Apps.AutoBindReferences.push({
                        //    Name: bindpropname,
                        //    ComponentObject: c,
                        //    Component: c.Config.Name,
                        //    ElementType: e.localName,
                        //    ElementClass: e.className
                        //});

                        ////For simplicity make type name same as property
                        //$(e).attr('data-bind-type', bindpropname);

                        ////Bind and validate existing values
                        //Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);

                        Apps.BindElement(bindpropname, c);
                    //}
                    //else
                    //    console.debug('Found ' + existing.length + ' data-bind-property ' + bindpropname + ' in ' + c.Config.Name);
                    //});

                }
                else {
                    console.debug('Component ' + c.Config.Name + ' has no Model');
                }
            }
            catch (err) {
                console.debug(bindpropname + ' does not appear to be found in ' + c.Config.Name + ' model');
            }

            //long sizeInBytes = Directory.EnumerateFiles("{path}","*", SearchOption.AllDirectories).Sum(fileInfo => new FileInfo(fileInfo).Length);
        });
    },
    BindElement: function (propertyName, component) {
        
        let references = Apps.AutoBindReferences;
        let elementSelector = $('[data-bind-property="' + propertyName + '"]');
        let collectionSelector = $('[data-bind-collection-property="' + propertyName + '"]');
        let contentType = elementSelector.attr('data-bind-contenttype');

        //hide inside templates 
        elementSelector.find('[data-bind-template]').hide();

        let isCollection = false;
        if (collectionSelector.length > 0) {
            isCollection = true;
            elementSelector = collectionSelector;
        }

        $.each(elementSelector, function (i, s) {

            let selector = $(s);
            let hasElement = selector.length > 0;

            let existing = Enumerable.From(references).Where(r => r.Name == propertyName).ToArray();

            if (existing.length == 0) {

                Apps.AutoBindReferences.push({
                    Name: propertyName,
                    ComponentObject: component,
                    Component: component.Config.Name,
                    ElementType: hasElement ? selector[0].localName : '[no element]',
                    ElementClass: hasElement ? selector[0].className : '[no element]'
                });
            }

            //For simplicity make type name same as property
            elementSelector.attr('data-bind-type', propertyName);

            if (component.Controls[propertyName]) {

                if (component.Controls[propertyName].Value == undefined) {
                    //Set initial value
                    let val = '';
                    Object.defineProperty(component.Controls[propertyName], 'Value', {
                        get() {
                            return val;
                        },
                        set(x) {
                            val = x;
                        }
                    });

                    if (hasElement) {
                        switch (selector[0].localName) {
                            case 'span':
                            case 'div':

                                if (contentType == 'text')
                                    component.Controls[propertyName].Value = selector.text()
                                else if (contentType == 'html')
                                    component.Controls[propertyName].Value = selector.html()

                                break;

                        }
                    }
                    component.Controls[propertyName].Value = selector.html();
                }
                Apps.Bind.DataBindControls(component.Model, propertyName, component.Controls, isCollection, true);
            }
        });
    },
    GetMoveBindSourcex: function (sourceId, destinationId, c, moveOnly) {

        if (destinationId == null)
            destinationId = sourceId;

        let references = Apps.AutoBindReferences;

        let sourceHtml = $('script[id="' + sourceId + '"]').html();
        let destinationElement = $('[data-bind-destination="' + destinationId + '"]'); //There should be only one matching destination property for island

        if (destinationElement.length == 1) {

            //Parse html of island (look for properties to bind)
            let currentDom = new DOMParser().parseFromString(sourceHtml, 'text/html');
            let bindElements = currentDom.querySelectorAll('[data-bind-property]');

            ////Add type attribute
            //$.each(bindElements, function (i, e) {
            //    let propname = $(e).attr('data-bind-property'); // "ShippingAddressHTML";
            //    $(e).attr('data-bind-type', propname); //For simplicity make type name same as property
            //});

            // html = $('div[data-bind-island="' + id + '"]').html(); //Re-grab modified html

            //Drop island on destination element
            $(destinationElement).html(sourceHtml);

            if (!moveOnly) {

                Apps.BindDestination($(destinationElement), c);
                //    //Bind inner properties
                //    let innerElements = $(destinationElement).find('[data-bind-property]');

                //    $.each(innerElements, function (i, e) {

                //        var bindpropname = $(e).attr('data-bind-property'); // "ShippingAddressHTML";

                //        //Get where not in list or control count is different
                //        let existing = Enumerable.From(references).Where(r => r.Name == bindpropname).ToArray();

                //        if (existing.length == 0) {

                //            try {
                //                if (c.Model) {

                //                    $(e).attr('data-bind-type', bindpropname); //For simplicity make type name same as property
                //                    //$.each(elements, function (i, e) {

                //                    //var propertyName = $(e).attr('data-bind-property');
                //                    var propertyValue = eval('c.Model.' + bindpropname);
                //                    var elementType = e.localName.toLowerCase();

                //                    if (elementType == 'div' || elementType == 'span') {
                //                        e.innerText = propertyValue;
                //                    }
                //                    else if (elementType == 'input') {
                //                        e.defaultValue = propertyValue; // eval(componentString); // + '.Model.' + propertyName);
                //                    }
                //                    else if (elementType == 'option') {
                //                        e.innerText = propertyValue; // eval(componentString);
                //                    }

                //                    //Add reference
                //                    Apps.AutoBindReferences.push({
                //                        Name: bindpropname,
                //                        ComponentObject: c,
                //                        Component: c.Config.Name,
                //                        ElementType: e.localName,
                //                        ElementClass: e.className
                //                    });

                //                    //Bind
                //                    Apps.Bind.DataBindControls(c.Model, bindpropname, c.Controls);

                //                    //});

                //                }
                //                else {
                //                    console.debug('Component ' + c.Config.Name + ' has no Model');
                //                }
                //            }
                //            catch (err) {
                //                console.debug(bindpropname + ' does not appear to be found in ' + c.Config.Name + ' model');
                //            }

                //        }
                //        else
                //            console.debug('Found ' + existing.length + ' data-bind-property ' + bindpropname + ' in ' + c.Config.Name);

                //    });
            }
            //    //Bind
            //    $.each(Apps.AutoBindReferences, function (i, r) {
            //        Apps.Bind.DataBindControls(r.ComponentObject.Model, r.Name, r.ComponentObject.Controls);
            //    });
        }
        else
            console.debug('Not exactly 1 destination property ' + destinationId);

        return sourceHtml;
    },
    AutoBindContents: function (currentHtml) {

        let currentDom = new DOMParser().parseFromString(currentHtml, 'text/html');

        if (currentDom.children[0].children[1].children.length == 1) { //dom inserts doc/html/body

            try {

                let bindElements = currentDom.querySelectorAll('[data-bind-property]');

                if (bindElements.length > 0) {
                    $.each(bindElements, function (index, element) {


                        var propertyName = $(element).attr('data-bind-property');
                        var elementType = element.localName.toLowerCase();
                        var modelProperty = eval(fullModelPath + '.' + propertyName);

                        if (elementType == 'div' || elementType == 'span') {
                            element.innerText = modelProperty;
                        }
                        else if (elementType == 'input') {
                            componentTag.defaultValue = modelProperty; // eval(componentString); // + '.Model.' + propertyName);
                        }
                        else if (elementType == 'option') {
                            componentTag.innerText = modelProperty; // eval(componentString);
                        }

                        //    $.each(props, function (tindex, prop) {
                        //    });
                    });
                    currentHtml = currentDom.body.innerHTML; // current.html();
                }
            }
            catch (err) {
                //
            }
        }

        return currentHtml;

    },
    AutoBindReferences: [],
    LoadDocumentIslands: function () {
        Apps.Islands = document.querySelectorAll('Island');
    },
    LoadIslands: function () {

        $.each(Apps.ComponentList, function (index, component) {

            if (component.UI && component.UI.Templates) {

                let templateNames = Object.keys(component.UI.Templates);

                $.each(templateNames, function (i, t) {

                    Apps.LoadIsland(component.UI.Templates[t]);

                });
            }

        });

    },
    LoadIsland: function (template) {


        //Add template islands
        //let thisTemplate = component.UI.Templates[template.id];
        template['Islands'] = [];

        let templateHtml = template.HTML();

        let templateDom = new DOMParser().parseFromString(templateHtml, 'text/html');

        let islands = templateDom.querySelectorAll('Island');

        $.each(islands, function (i, island) {
            template.Islands.push(island);
        });

    },

    //BindComponents: function () {
    //    //let componentNames = Object.keys(Apps.Components);
    //    $.each(Apps.ComponentList, function (index, component) {
    //        Apps.BindComponent(component);
    //    });
    //},
    //BindComponent: function (c) {
    //    console.debug('bind ' + c.Path);

    //    //Look for island destinations on document
    //    if (c.UI) {

    //        let uiTemplates = Object.keys(c.UI.Templates);

    //        $.each(uiTemplates, function (i, templateName) {

    //            let template = c.UI.Templates[templateName];



    //            $.each(template.Islands, function (i, island) {

    //            });

    //        });
    //    }
    ////    if (c.Components) {
    ////        $.each(c.Components, function (index, component) {
    ////            Apps.BindComponent(component);
    ////        });
    ////    }
    //},

    TestComponents: function () {
        let componentNames = Object.keys(Apps.Components);
        $.each(componentNames, function (index, componentName) {
            Apps.TestComponent(Apps.Components[componentName]);
        });
    },
    TestComponent: function (c) {
        console.debug('test for ' + c.Path);
        if (c.Test) {
            c.Test();
        }
        if (c.Components) {
            $.each(c.Components, function (index, component) {
                Apps.TestComponent(component);
            });
        }
    },
    BlockUI: function (settings) {
        if ($.isFunction($.blockUI)) {
            if (settings) {
                $.blockUI(settings);
            }
            else {
                $.blockUI();
            }
        }
    },
    UnBlockUI: function () {
        if ($.isFunction($.blockUI))
            $.unblockUI();
    },
    Notify: function (type, message, title, position, x, y) {

        //Example calls:
        //Info Notification: vNotify.info({ text: 'text', title: 'title' });

        //Success Notification: vNotify.success({ text: 'text', title: 'title' });

        //Warning Notification: vNotify.warning({ text: 'text', title: 'title' });

        //Error Notification: vNotify.error({ text: 'text', title: 'title' });

        //Notify Notification: vNotify.notify({ text: 'text', title: 'title' });

        //Example globals:
        //vNotify.options = {
        //    fadeInDuration: 2000,
        //    fadeOutDuration: 2000,
        //    fadeInterval: 50,
        //    visibleDuration: 5000,
        //    postHoverVisibleDuration: 500,
        //    position: positionOption.topRight,
        //    sticky: false,
        //    showClose: true
        //};

        //var positionOption = {
        //    topLeft: 'topLeft',
        //    topRight: 'topRight',
        //    bottomLeft: 'bottomLeft',
        //    bottomRight: 'bottomRight',
        //    center: 'center'
        //};

        if (vNotify) {

            var delay = 1000;

            if (x && y)
                delay = 500;

            if (type === 'warning' || type === 'error')
                visibleDuration = 10000;

            vNotify.options = {
                fadeInDuration: 2000,
                fadeOutDuration: 2000,
                fadeInterval: 50,
                visibleDuration: -1,
                postHoverVisibleDuration: 500,
                position: position ? position : vNotify.positionOption.topRight,
                sticky: true,
                showClose: true
            };

            var messageObject = title ? { text: message, title: title, position: vNotify.options.position } : { text: message, position: vNotify.options.position, x: x, y: y };
            switch (type) {
                case 'info': vNotify.info(messageObject); break;
                case 'success': vNotify.success(messageObject); break;
                case 'warning': vNotify.warning(messageObject); break;
                case 'error': vNotify.error(messageObject); break;
                case 'notify': vNotify.notify(messageObject); break;
                case 'custom': vNotify.custom(messageObject); break;
            }
        }
        else
            console.log(type + ' notify: ' + message);
    },
    QueryStrings: function () {
        var qs_vars = [], hash;
        var q = document.URL.split('?')[1];
        if (q !== undefined) {
            q = q.split('&');
            for (var i = 0; i < q.length; i++) {
                hash = q[i].split('=');
                qs_vars.push(hash[1]);
                qs_vars[hash[0]] = hash[1];
            }
        }
        //Me.QueryString = qs_vars;
        return qs_vars;
    },
    CreateComponent: function (componentName) {
        var createComponentUrl = Apps.Settings.WebRoot + '/api/appsjs/CreateComponent?appsRoot=/' + Apps.Settings.VirtualFolder + '/Scripts/Apps&componentName=' + componentName;

        Apps.Util.Get(createComponentUrl, function (error, result) {

        });
    },
    CreateComponent2: function (componentName, framework) {
        var createComponentUrl = Apps.Settings.WebRoot + '/api/appsjs/CreateComponent2?appsRoot=/' + Apps.Settings.VirtualFolder + '/Scripts/Apps&componentName=' + componentName + '&framework=' + framework;

        Apps.Util.Get(createComponentUrl, function (error, result) {

        });
    },
    Ajax: function (verb, url, dataObjString, callback, successCallback, sync) {
        if (verb === null)
            verb = "POST";

        //if (dataObj == null)
        //    dataObj = new Object();

        $.ajax({
            type: verb,
            url: url,
            data: dataObjString,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                //'Authorization': 'Bearer ' + Apps.GetAuthenticationData(),
                'by': Apps.By,
                'Accept': '*/*',
                'Content-Type': 'application/json'
                //'Access-Control-Allow-Origin': '*'
            },
            async: !sync,
            success: function (result) {
                if (callback)
                    callback(false, result, successCallback);
            },
            error: function (result) {
                if (callback)
                    callback(true, result);
            }
        });

    },
    Upload: function (url, formData) {

        //event.preventDefault();

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            async: false,
            cache: false,
            contentType: 'application/json',
            processData: false,
            success: function (response) {

                //alert(response);
            },
            error: function (result) {

            }
        });
    },
    Get: function (url, callback, sync) {
        Apps.Ajax('GET', url, null, callback, null, sync);
    },
    Get2: function (url, callback) {
        Apps.Ajax('GET', url, null, function (error, result) {
            Apps.HandleAjaxResult(error, result, callback);
        }, false);
    },
    Put: function (url, callback, data) {
        Apps.Ajax('PUT', url, data, callback, false);
    },
    Post: function (url, dataString, callback) {
        Apps.Ajax('POST', url, dataString, function (error, result) {
            Apps.HandleAjaxResult(error, result, callback);
        }, null, false); //Async
    },
    Post2: function (url, dataString, callback) {
        Apps.Ajax('POST', url, dataString, function (error, result) {
            Apps.HandleAjaxResult(error, result, callback);
        }, false);
    },
    GetSync: function (url, dataString, callback) {
        Apps.Ajax('GET', url, null, function (error, result) {
            Apps.HandleAjaxResult(error, result, callback);
        }, null, true);
    },
    PostSync: function (url, dataString, callback) {
        Apps.Ajax('POST', url, dataString, function (error, result) {
            Apps.HandleAjaxResult(error, result, callback);
        }, null, true);
    },
    WebService: function (wsUrl, data, callback) {
        $.ajax({
            type: 'POST',
            url: wsUrl, //Apps.Settings.WebRoot + '/DriversLicenseWebService.asmx/ValidateDriversLicense',
            data: data, // "{ driversLicense: '" + licenseNumber + "' }",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                Apps.HandleAjaxResult(false, data.d, callback);
            },
            error: function (data) {
                Apps.HandleAjaxResult(true, data, callback);
            }
        });

    },
    WebServiceXML: function (path, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                if (callback)
                    callback(this.response);
            }
        };
        xhttp.open('POST', path, true);
        xhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhttp.send();
    },
    HandleAjaxResult: function (error, result, callback) {
        //Handle result
        if (!error) {
            if (result.Success) {
                //Sunny day, all good
                if (callback)
                    callback(result);
            }
            else {

                //For PA and other callers, allow them to use their own handling of FailMessages
                ////Check if want to send a custom message along with failure
                //if (!result.ShowFailMessage) {

                //    vNotify.error({ text: 'A problem ocurred on the server.', title: 'Server Error', sticky: false, showClose: true });
                //    let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
                //    textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');
                //}
                //else {
                //    Apps.Notify('warning', result.FailMessage);
                //}

                if (callback)
                    callback(result);
            }
        }
        else {
            //Apps.Notify('error', 'An exception happened during the last operation. Response: ' + responseText); //esult.inn. See the error dialog and logs for more information.');

            //if (Apps.Settings.Debug) {
            //    Apps.Components.Helpers.Dialogs.Content('AppsErrorDialog', JSON.stringify(result));
            //    Apps.Components.Helpers.Dialogs.Open('AppsErrorDialog');
            //}
            vNotify.error({ text: 'A problem ocurred on the server.', title: 'Server Error', sticky: false, showClose: true });
            let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
            textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(JSON.stringify(result)) + '\');">View Response</div>');

            if (callback)
                callback(result);
        }
    },
    ShowResult: function (result) {

        let resultHtml = '';

        resultHtml += '<b>Successes</b></br>';
        $.each(result.SuccessMessages, function (index, message) {
            resultHtml += message + '</br>';
        });

        resultHtml += '<b>Failures</b></br>';
        $.each(result.FailedMessages, function (index, message) {
            resultHtml += message + '</br>';
        });

        vNotify.error({ text: 'Accumulated Success and Fail messages', title: 'Result Messages', sticky: false, showClose: true });
        let textDiv = $('body > div.vnotify-container.vn-top-right > div > div.vnotify-text');
        textDiv.append('<div class="btn btn-dark" style="margin-top:10px;" onclick="Apps.Components.Helpers.OpenResponse(\'' + escape(resultHtml) + '\');">View Result</div>');

    },
    ShowMessages: function (result) {
        if (result && result.Messages) {
            //$.each(result.SucMessages, function (index, message) {
            //    Apps.Notify('warning', message);
            //});
            $.each(result.FailMessages, function (index, failMessage) {
                vNotify.error({ text: failMessage, title: 'Fail Message', sticky: true, showClose: true });
            });
        }
        else {
            Apps.Notify('info', 'No messages available for failed call.');
        }
    },
    Auth: function (url, token, by, callback) {
        $.ajax({
            type: "PUT",
            url: "api/Validate",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + token,
                'by': by
            }
        }).done(function () {
            //console.log('PUT success.');
            if (callback)
                callback(false, arguments[0]); //error, result
        }).fail(function () {
            //console.log('Fail on todo PUT');
            if (callback)
                callback(false);
        }).always(function () {
            //refreshViewData();
            //description.val('');
        });
    },
    SetPolyfills: function () {
        if (!Object.keys) {
            Object.keys = (function () {
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function (obj) {
                    if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

                    var result = [];

                    for (var prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) result.push(prop);
                    }

                    if (hasDontEnumBug) {
                        for (var i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
                        }
                    }
                    return result;
                };
            })();
        }
    }

};
Apps.Data = {
    /*
     For every GET, creates an object with
     1. A Path property holding the path used
     2. A Data  property holding the resulting data
     3. A Refresh() method to call and refresh data when needed

    Instructions
    1. Create a new method for every data object, providing optional
    parameters and optional callback.

    2. In the method call "Me.Set([hard-coded url], function(data))"
    Note that "Set" handles errors and will not call back but
    instead show notifications.

    3. Optionally clean up the data returned and optionally call back
     */

    //Apps.Data.Register('App', '/api/Apps/GetApp?appId={0}')
    //Apps.Data.Load('App', function () {
    //Apps.Data.App.Refresh();
    //Apps.Data.App.Selected = selectedApp; //For collections

    Selected: null,

    Gets: [],
    Posts: [],
    RegisterGET: function (getDataName, url, component) {

        var dataName = getDataName;

        this.Gets.push({ DataName: dataName, URL: url, Args: null });

        var parentObj = Apps;

        if (component) {
            parentObj = component;
            if (parentObj.Data == null)
                parentObj['Data'] = {};
        }

        parentObj.Data[dataName] = {
            Success: false,
            Path: url,
            Data: null,
            Refresh: function (args, callback) {

                var refreshDataName = dataName
                let newPath = this.Path.SearchAndReplace.apply(parentObj.Data[refreshDataName].Path, args);

                Apps.Get(newPath, function (error, result) {

                    var methodDataName = dataName;

                    if (!error) {
                        parentObj.Data[methodDataName].Success = !error && result.Success;
                        parentObj.Data[methodDataName].Data = result.Data;
                    }
                    else
                        parentObj.Data.HandleException(result);

                    parentObj.Data[methodDataName].Result = result;

                    if (callback)
                        callback();
                });
            }
        };

    },
    RegisterMyGET: function (me, getName, url, args, sync) {

        if (!me.Data)
            me['Data'] = {};

        if (!me.Data.Gets)
            me.Data.Gets = [];

        me.Data.Gets[getName] = {
            Success: false,
            Path: url,
            Data: {},
            Sync: sync,
            Selected: null,
            Refresh: function (args, callback) {

                var refreshGetName = getName;

                let newPath = this.Path.SearchAndReplace.apply(me.Data.Gets[refreshGetName].Path, args);

                Apps.Get(newPath, function (error, result) {

                    var getGetName = getName;

                    if (!error) {
                        me.Data.Gets[getGetName].Success = !error && result.Success;
                        me.Data.Gets[getGetName].Data = result.Data;
                    }
                    else
                        Apps.Data.HandleException(result);

                    me.Data.Gets[getGetName].Result = result;

                    if (callback)
                        callback();

                }, me.Data.Gets[getName].Sync);
            }

        };
    },
    RegisterPOST: function (dataName, url, args) {
        this.Posts.push({ DataName: dataName, URL: url, Args: args });
    },
    //DoNothing: function () {
    //    //that's right
    //},
    RegisterMyPOST: function (me, postName, postUrl, args, sync) {

        if (!me.Data)
            me['Data'] = {};

        if (!me.Data.Posts)
            me.Data.Posts = [];

        me.Data.Posts[postName] = {
            Success: false,
            Path: postUrl,
            Data: {},
            Refresh: function (obj, args, callback) {

                var refreshPostName = postName;
                var refreshSync = sync;

                let newPath = this.Path.SearchAndReplace.apply(me.Data.Posts[refreshPostName].Path, args);

                let refreshPost = sync ? Apps.PostSync : Apps.Post;

                //setTimeout(Apps.Data.DoNothing, 1000);

                refreshPost(newPath, JSON.stringify(obj), function (result) {


                    var postPostName = postName;

                    if (result.Success) {
                        me.Data.Posts[postPostName].Success = true; //!error && result.Success;
                        me.Data.Posts[postPostName].Data = result.Data;
                    }
                    else {
                        me.Data.Posts[postPostName].Success = false;
                        Apps.Data.HandleException(result);
                    }
                    me.Data.Posts[postPostName].Result = result;


                    if (callback)
                        callback();
                });
            },
            Execute: function (resultString, args, callback) {

                var refreshPostName = postName;
                var refreshSync = sync;

                let newPath = this.Path.SearchAndReplace.apply(me.Data.Posts[refreshPostName].Path, args);

                let refreshPost = sync ? Apps.PostSync : Apps.Post;

                //setTimeout(Apps.Data.DoNothing, 1000);

                refreshPost(newPath, resultString, function (result) {


                    var postPostName = postName;

                    if (result.Success) {
                        me.Data.Posts[postPostName].Success = true; //!error && result.Success;
                        me.Data.Posts[postPostName].Data = result.Data;
                    }
                    else {
                        me.Data.Posts[postPostName].Success = false;
                        Apps.Data.HandleException(result);
                    }
                    me.Data.Posts[postPostName].Result = result;


                    if (callback)
                        callback();
                });
            }
        };

    },
    GetPostArgs: function (requestName) {
        let args = {
            "Params":
                [
                    { "Name": "RequestName", "Value": requestName }
                ]
        };
        return args;
    },
    ExecutePostArgs: function (args, successcallback) {
        Apps.Data.GlobalPOST.Execute(args, function () {

            if (Apps.Data.GlobalPOST.Success && Apps.Data.GlobalPOST.Result.FailMessages.length == 0) {
                if(successcallback)
                    successcallback(Apps.Data.GlobalPOST);
            }
            else
                Apps.Components.BPL.HandleError(Apps.Data.GlobalPOST.Result);
        });

    },
    Execute: function (requestCommand, args, successcallback, errorcallback, data) {


        args.push({ Name: 'RequestName', Value: requestCommand });

        let result = {
            Params: args,
            Data: data
        };

        Apps.Data.GlobalPOST.Execute(result, function () {

            if (Apps.Data.GlobalPOST.Success && Apps.Data.GlobalPOST.Result.FailMessages.length == 0) {
                if (successcallback)
                    successcallback(Apps.Data.GlobalPOST);
            }
            else {
                if (errorcallback)
                    errorcallback(Apps.Data.GlobalPOST.Result);
                else
                    Apps.Components.BPL.HandleError(Apps.Data.GlobalPOST.Result);
            }
        });
    },
    RegisterGlobalPOST: function (postUrl, args, sync) {

        Apps.Data.GlobalPOST = {
            Success: false,
            Path: postUrl,
            Data: {},
            Execute: function (obj, callback) {

                let newPath = this.Path.SearchAndReplace.apply(Apps.Data.GlobalPOST.Path, args);

                let refreshPost = sync ? Apps.PostSync : Apps.Post;
                refreshPost(newPath, JSON.stringify(obj), function (result) {

                    if (result.Success) {
                        Apps.Data.GlobalPOST.Success = true; //!error && result.Success;
                        Apps.Data.GlobalPOST.Data = result.Data;
                    }
                    else {
                        Apps.Data.GlobalPOST.Success = false;
                        Apps.Data.HandleException(result);
                    }
                    Apps.Data.GlobalPOST.Result = result;

                    if (callback)
                        callback();
                });
            },
        };

    },

    Post: function (dataName, obj, callback) {

        let mycallback = callback;
        let dataSources = Enumerable.From(this.Posts).Where('$.DataName == "' + dataName + '"').ToArray();

        if (dataSources.length == 1) {

            let dataSource = dataSources[0];
            let url = dataSource.URL;

            if (dataSource.Args && dataSource.Args.length > 0) {
                url = url.SearchAndReplace.apply(url, dataSource.Args);
            }

            Apps.Post(url, JSON.stringify(obj), function (error, result) {
                if (!error) {
                    if (result.Success) {
                        if (mycallback)
                            mycallback(result);
                    }
                    else {
                        Apps.ShowMessages(result);
                        if (mycallback)
                            mycallback();
                    }
                }
                else {
                    Apps.Data.HandleException(result);
                }
            });
        }
        else
            Apps.Notify('warning', 'Data source name not found or more than one found: ' + dataName);

    },
    HandleException: function (result) {
        if (result) {
            if (result.responseText && result.responseText.length > 50) {
                Apps.Notify('error', 'From server: ' + result.responseText.substring(0, 50));
                //vNotify.error({ text: 'text', title: 'title', sticky: true, showClose: true });
            }
            else if (result.responseText) {
                Apps.Notify('error', 'From server: ' + result.responseText);
            }
        }
        //Removed as unhelpfule from within power apps
        //    else {
        //        Apps.Notify('error', 'Unable to contact web server.');
        //    }
    },
};
Apps.Template = function (settings) {

    this.TemplateID = settings.id; // templateId;
    //this.Selector = $("#" + this.TemplateID);

    //this.Selector.html(settings.data);
    this.Load = function (content) {

        if (!document.getElementById(this.TemplateID)) {

            //let templateNode = document.createElement('div');
            //templateNode.id = this.TemplateID;
            //templateNode.style.display = "none";
            //document.body.appendChild(templateNode); //Put template on dom first


            this.Template = document.createElement('script');
            this.Template.id = 'template' + this.TemplateID;
            this.Template.type = "text/template";
            this.Template.innerHTML = content;

            this.Selector = $(this.Template);

            document.body.appendChild(this.Template); //Puts template inside div container (not template inner html)
        }
    };

    this.Drop = function (argsArray) {
        //Get template html and drop to dom and reload selector
        // var content = Apps.Util.DropTemplate(this.TemplateID);
        if (!document.getElementById('content' + this.TemplateID)) {


            if (this.Template) {
                //Gets html from template and puts inside container div (exposing it)
                var content = this.Template.innerHTML; // this.Selector.find('div').html();

                if (argsArray)
                    content = content.SearchAndReplace.apply(content, argsArray);


                let contentDiv = document.createElement('div');
                contentDiv.id = 'content' + this.TemplateID;
                contentDiv.classList = this.TemplateID + 'ContentStyle';
                contentDiv.innerHTML = content;

                this.Selector = $(contentDiv); // document.getElementById(this.TemplateID);

                document.body.appendChild(contentDiv);
            }
        }


        // if($(content).length === 0)
        // if ($('#' + $(content)[0].id).length === 0)
        //    this.Selector.append(content);
        //   //this.Selector.append(content);

        return this;
    };
    //this.DropToDocument = function (argsArray) {
    //    //Get template html and drop to dom and reload selector
    //    // var content = Apps.Util.DropTemplate(this.TemplateID);
    //    if (!document.getElementById('content' + this.TemplateID)) {

    //        this.Selector = document.getElementById(this.TemplateID);

    //        if (this.Template) {
    //            //Gets html from template and puts inside container div (exposing it)
    //            var content = this.Template.innerHTML; // this.Selector.find('div').html();

    //            if (argsArray)
    //                content = content.SearchAndReplace.apply(content, argsArray);


    //            let contentDiv = document.createElement('div');
    //            contentDiv.id = 'content' + this.TemplateID;
    //            contentDiv.classList = this.TemplateID + 'ContentStyle';
    //            contentDiv.innerHTML = content;

    //            document.body.appendChild(contentDiv);
    //        }
    //    }


    //    // if($(content).length === 0)
    //    // if ($('#' + $(content)[0].id).length === 0)
    //    //    this.Selector.append(content);
    //    //   //this.Selector.append(content);

    //    return this;
    //};

    this.Show = function (speed) {

        //Re-check since variable doesn't change when removed from dom
        //this.Selector = $(this.TemplateID);

        //if (this.Selector.length === 0)
        this.Drop(); //Drops the inner template content

        //Find this components template references
        let bindElements = $(document.body).find('[data-bind-template]'); //) $(this.Template.innerHTML).find('[data-bind-template]');

        //Iterate through each template reference in this component
        $.each(bindElements, function (index, element) {

            let templateReferenceName = $(element).attr('data-bind-template');

            //Iterate and find in other components
            $.each(Apps.ComponentList, function (index, component) {

                if (component.UI && component.UI.Templates) {

                    let templateNames = Object.keys(component.UI.Templates);

                    $.each(templateNames, function (i, t) {

                        if (t == templateReferenceName)
                            $(element).html(component.UI.Templates[t].HTML());

                    });
                }

            });

        });


        // this.Selector.style.opacity = 0;
        if (this.Selector)
            this.Selector.show(); //.style.display = 'block';


        return this;
    };
    this.Hide = function (speed) {

        //if (this.Selector.length === 0)
        //    this.Drop();

        //this.Selector.style.display = 'none';
        //let mySelector = $('#' + this.TemplateID);
        //if (mySelector)
        //    mySelector.hide(speed); //this.Selector.style.display = 'none';

        if (this.Selector)
            this.Selector.hide(speed);

        return this;
    };
    //Show me, hide all else
    this.HideAll = function (speed) {
        var thisTemplateId = this.TemplateID;
        this.Show(speed);
        $.each(Apps.ComponentList, function (index, component) {

            if (component.UI && component.UI.Templates) {
                if (component.UI.TemplateID != thisTemplateId)
                    component.UI.Hide(speed);
            }

        });

    };
    this.Remove = function () {

        if (this.Selector.length === 1)
            this.Selector.detach();

        return this;
    };
    this.Move = function (top, left) {
        if (this.Selector.length === 0)
            this.Drop();

        this.Selector.css("left", left).css("top", top);

        return this;
    };
    this.Width = function (width) {
        if (this.Selector.length === 0)
            this.Drop();

        this.Selector.width(width);
        return this;
    };
    this.Height = function (height) {
        if (this.Selector.length === 0)
            this.Drop();

        this.Selector.height(height);
        return this;
    };
    this.Css = function (name, value) {
        if (this.Selector.length === 0)
            this.Drop();

        this.Selector.css(name, value);
        return this;
    };
    this.Animate = function (animation) {
        if (this.Selector.length === 0)
            this.Drop();

        this.Selector.animate(animation);
        return this;
    };
    this.Bind = function (data, key, isCollection, callback) {
        if (this.Selector.length === 0)
            this.Drop();

        Apps.Binder.DataBind(data, key, isCollection, callback);
        return this;
    };
    this.BindTable = function (settings) { //data, key, tableid, rowtemplateid, rowbinding, rowbound, tablebound) {

        if (this.Selector.length === 0)
            this.Drop();

        settings.template = this; //access to parent template

        var table = Apps.Binder.DataBindTable(settings);
        $.each($(table).find("td"), function (index, td) {
            $(td).css("padding", "5px");
        });
        //{
        //    databindkey : settings.databindkey,
        //    data: settings.data,
        //    rowtemplateid: settings.rowtemplateid,
        //    tableid: settings.tableid,
        //    rowbinding: settings.rowbinding,
        //    rowbound: settings.rowbound,
        //    tablebound: settings.tablebound
        //})
        return this;
    };
    this.HTML = function (paramArray) {
        if (this.Selector.length === 0)
            this.Drop();

        var currentHtml = $("#" + this.TemplateID).html();
        var newHtml = currentHtml.SearchAndReplace.apply(currentHtml, paramArray);

        ////process data island templates
        //let bindElements = $(this.Selector).find('[data-bind-template]');
        //let exist = bindElements.length;

        //$.each(bindElements, function (index, element) {
        //    $(element).hide();
        //});

        this.Selector.html(newHtml);
        return this;
    };
    this.Click = function (sender, args) {

        return this;
    }; //Accepts events from template
    //this.AddContent = function (elementId, content) {

    //    var templateContent = Apps.Util.GetContent('templateCategoriesList');
    //    $('#divCategoryList').html(categories);


    //};
    this.Register = function (name, templateId) {

        let html = Apps.Util.GetHTML(templateId);

        this[name] = {};
        this[name] = new Apps.ComponentTemplate({ id: name, content: html });
        //this[name].Drop(html);

        return this[name];
    };
    return this;

};

Apps['AppDialogs'] = {
    Dialogs: [],
    OpenCallback: null,
    CloseCallback: null,
    SaveCallback: function (obj, id) {
        if (obj)
            obj(id);
    },
    CancelCallback: function (obj, id) {
        if (obj)
            obj(id);
    },
    MouseOverCallback: null,
    MouseOutCallback: null,
    ClickCallback: null,
    Register: function (me, dialogName, settings) {

        if (!me.Dialogs)
            me['Dialogs'] = [];

        let buttonHtml = '';
        if (settings.buttons) {
            $.each(settings.buttons, function (index, button) {
                if (button) {
                    buttonHtml += '<div class="btn btn-success" id="' + button.id + '" onclick="' + button.action + '">' + button.text + '</div>';
                }
            });
        }

        if (!settings.content)
            settings.content = '';

        var newDialog = new this.DialogModel(dialogName, settings.content, settings.title, 0, settings.cancelfunction, null, buttonHtml, '');

        let baseContentPre = this.GetBaseTemplate();
        let baseContent = baseContentPre.SearchAndReplace.apply(baseContentPre, [settings.content, settings.title, dialogName, settings.dialogtype, buttonHtml, settings.closeaction]);

        $(document.body).append('<div id = "myDialog_' + dialogName + '_DialogContainer" style="display:none;"></div>');

        newDialog.Selector = $("#myDialog_" + dialogName + '_DialogContainer');

        newDialog.Selector.html(baseContent);

        me.Dialogs[dialogName] = newDialog;
        me.Dialogs.push(newDialog);
    },
    GetBaseTemplate: function () {

        //0 = content
        //1 = title
        //2 = id
        //3 = dialog type(e.g. 'full-width')
        //4 = button html
        //5 = close function

        let str = '';
        str += '            <div id="myDialog_{2}" class="dialog open">';
        str += '                <div class="dialog-container {3} dialog-scrollable">';
        str += '                    <div class="dialog-content">';
        str += '                        <div class="dialog-header">';
        str += '                            <table>';
        str += '                                <tr>';
        str += '                                    <td><h5 class="dialog-title">{1}</h5></td>';
        str += '                                    <td><div id="myDialog_{2}_Header_AdditionalContent" class="myDialog_{2}_Header_AdditionalContent_Style"></div></td>';
        str += '                                </tr>';
        str += '                            </table>';

        str += '                            <button type="button" class="close-dialog" onclick="Apps.AppDialogs.Close(\'{2}\')">&times;</button>';
        str += '                        </div>';
        str += '                        <div class="dialog-body original-load">';
        str += '                            <div id="myDialog_{2}_Content">{0}</div>';
        str += '                        </div>';
        str += '                        <div class="dialog-footer">';
        str += '                            <div id="myDialog_{2}_Footer_AdditionalContent"></div>';
        str += '                            {4}';
        str += '                        </div>';
        str += '                    </div>';
        str += '                </div>';
        str += '            </div>';

        return str;
    },
    Close: function (id) {
        $('#myDialog_' + id + '_DialogContainer').fadeOut();
    },
    Result: function (message, data) {
        return {
            Success: false,
            Message: message,
            FailedMessages: [],
            SuccessMessages: [],
            Data: data
        };
    },
    DialogModel: function (newid, content, title, size, cancelclick, saveclick, buttonHtml, subtitle) {

        var result = {
            ElementID: newid,
            Selector: null,
            Width: '400px',
            Height: '200px',
            Title: title,
            Size: size,
            CancelClick: cancelclick,
            SaveClick: saveclick,
            ButtonHTML: buttonHtml,
            SubTitle: subtitle,
            Content: content,
            X: null,
            Y: null,
            Open: function (incomingContent) {
                let content = incomingContent != undefined ? incomingContent : this.Content;
                $('#myDialog_' + newid + '_Content').html(unescape(content));
                $("#myDialog_" + newid + '_DialogContainer').fadeIn("slow");
            },
            Close: function () {
                $("#myDialog_" + newid + '_DialogContainer').fadeOut("slow");
            }

        };
        return result;
    }

};

//This handles UI chunks. 
//Scenario #1: Grabbing a *template* chunk of HTML to be placed when and where needed (w/args)
//Scenario #2: Grabbing a *template* chunk of HTML to be iterated over and placed when and where needed (w/args)
//In either case the chunk must be put somewhere (e.g. "let html = Me.UI.Chunk1.HTML();")
//Usage:
/*
 
//Initialize
-----Apps.UI.Register('MyChunk1', 'My_Chunk1_Template_Id');----
UPDATE: All "text/template" scripts for a components file are registered automatically

//Put somewhere
$('#SomeHtmlContainer').html(Me.UI.Templates.MyChunk1.HTML([arg1, arg2]));

//Put directly on DOM
Me.UI.Templates.MyChunk1.Drop([arg1]);

 */
Apps.ComponentTemplate = function (settings) {
    this.Content = settings.content;
    this.ID = settings.id;
    this.Selector = null;
    this.Drop = function (argsArray, container) {


        if (!document.getElementById(this.ID + 'Div')) {

            let templateNode = document.createElement('div');
            templateNode.id = this.ID + 'Div';
            templateNode.style.display = "none";

            if (container)
                container.append(templateNode);
            else
                document.body.appendChild(templateNode);

            this['Selector'] = $('#' + this.ID + 'Div');
            //    this.Selector.html(this.Content);
            var currentHtml = this.Content;

            if (argsArray) {
                currentHtml = currentHtml.SearchAndReplace.apply(currentHtml, argsArray);
            }

            //$(templateNode).append(currentHtml);
            this.Selector.append(currentHtml);

            //Execute referenced methods
            let bindElements = this.Selector.find('[data-template-load]');

            $.each(bindElements, function (index, element) {
                let elementSelector = $(element);

                //Put referenced html below element
                let content = eval(elementSelector.attr('data-template-load'));
                elementSelector.html(content);

            });

            //Execute referenced methods on drop
            //this.Execute('data-template-ondrop');
        };


        return this;
    };
    this.Execute = function (attributeName) {

        let bindElements = this.Selector.find('[' + attributeName + ']');

        $.each(bindElements, function (index, element) {
            let elementSelector = $(element);

            //Put referenced html below element
            let content = eval(elementSelector.attr(attributeName));
            elementSelector.html(content);

        });

    };
    this.Show = function (speed) {

        this.Drop();

        if (this.Selector)
            this.Selector.show(speed);

        //Execute referenced methods on show
        this.Execute('data-template-onshow');

        return this;
    };
    this.Hide = function (speed) {

        if (this.Selector)
            this.Selector.hide(speed);

        return this;
    };
    //this.Remove = function () {

    //    if (this.Selector)
    //        this.Selector.detach();

    //    return this;
    //};
    this.HTML = function (argsArray) {

        var currentHtml = this.Content;
        // if (this.Selector) {

        if (argsArray) {
            currentHtml = currentHtml.SearchAndReplace.apply(currentHtml, argsArray);
            //this.Content = Selector.html(newHtml);
        }

        currentHtml = Apps.Bind.BindHTML(currentHtml);
        //currentHtml = Apps.Bind.BindIslands(currentHtml);

        ////process component model/controls
        //let bindComponents = $(currentHtml).find('[data-bind-component]');

        //$.each(bindComponents, function (index, componentTag) {

        //    var props = $(componentTag).children('[data-bind-property]');
        //    var componentString = $(componentTag).attr('data-bind-component');

        //    $.each(props, function (tindex, prop) {
        //        let propertyName = $(prop).attr('data-bind-property');
        //        currentHtml = currentHtml.replace(prop.outerHTML, eval(componentString + '.Model.' + propertyName));
        //    });
        //});

        ////process data islands
        //let bindIslands = $(currentHtml).find('[data-bind-island-destination]');
        //$.each(bindIslands, function (tindex, islandDestination) {

        //    let islandName = $(islandDestination).attr('data-bind-island-destination');
        //    let island = $(currentHtml).find('[data-bind-island=' + islandName + ']');

        //    if (island && island.length == 1) {
        //        $(island).removeProp('hidden');
        //        currentHtml = currentHtml.replace(islandDestination.outerHTML, $(island).html());
        //    }
        //});

        return currentHtml;
    };
    this.Bind = function (html) {

        this.Show();

        let bindElements = this.Selector.find('[data-template-bind]');


        $.each(bindElements, function (index, element) {
            let elementSelector = $(element);

            //Put referenced html below element
            let content = eval(elementSelector.attr('data-template-bind'));
            elementSelector.html(content);

        });

        return this.Selector.html();
    };
    this.BindClass = function (classname, async, show) {

        //Look only for these classes in this template
        let bindElements = this.Selector.find('.' + classname);

        $.each(bindElements, function (index, element) {

            let elementSelector = $(element);

            //Put referenced html below element
            let content = eval(elementSelector.attr('data-template-bindclass'));

            //For async, must drop on class manually (via bind method)
            if (async !== true)
                elementSelector.html(content);

            if (show === true)
                elementSelector.show();

        });
    },
        this.BindDropdown = function (dropdownId) {

            //Look only for these classes in this template
            let bindElements = this.Selector.find('#' + dropdownId);

            if (bindElements.length == 1) {

                let elementSelector = $(bindElements[0]);
                let content = eval(elementSelector.attr('data-template-binddropdown'));
                elementSelector.html(content);
            }
        },
        this.BindElement = function (elementSelector, methodString) {

            let content = eval(methodString);
            elementSelector.html(content);

        }

};
Apps.PreInit();