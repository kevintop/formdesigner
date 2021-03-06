function commonoperateList($scope) {
    var controlType = $(".commonangular").attr("controlType");
    var controlID = $(".commonangular").attr("controlID");
    if(controlType == "DropDownList" || controlType == "Radio") {
        $("#configure").addClass("choiceconfigure");
        $(".choiceconfigure").bind("click", function() {
            var datasource = openOperateDialog("设置" + controlType + "属性", "../../Plugins/Administration/Pages/ChooseDict.aspx", 550, 300, true, 1);
            if(datasource) $("#controlDataSource").val(datasource);
        });
    }
    var fields = form.Fields;
    for(var i = 0; i < fields.length; i++) {
        if(fields[i].Name == controlID) {
            $("#controlId").val(fields[i].Name);
            $("#controlName").val(fields[i].Text);
            $("#controlValue").val(fields[i].DefaultValue);
            $("#datatype").val(fields[i].DataType);
            $("#required")[0].checked = fields[i].Required;
            if(fields[i].DataSource) {
                $("#controlDataSource").val(fields[i].DataSource);
            }
            $("#accesspattern").val(fields[i].AccessPattern);
            $("#controlWidth").val($("#" + controlID).width());
            $("#controlHeight").val($("#" + controlID).height());
            if(!fields[i].ListItems) {
                fields[i].ListItems = new Array();
            }
            $scope.Lists = fields[i].ListItems;
            $scope.executeOperate = function(list) {
                if(list.indexOf("up$#") > 0) {
                    ListName = list.substring(0, list.indexOf("up$#"));
                } else {
                    ListName = list.substring(0, list.indexOf("down$#"));
                }
                angular.forEach($scope.Lists, function(List) {
                    var i = 0;
                    if(List.Value == ListName) {
                        var position = $scope.Lists.indexOf(List);
                        if(position > 0 && position < $scope.Lists.length) {
                            $scope.Lists.splice(position, 1);
                            if(list.indexOf("up$#") > 0) {
                                $scope.Lists.splice(position - 1, 0, List);
                                i = 1;
                            } else {
                                $scope.Lists.splice(position + 1, 0, List);
                                i = 1;
                            }
                        } else if(position == 0 && list.indexOf("down$#") > 0) {
                            $scope.Lists.splice(position, 1);
                            $scope.Lists.splice(position + 1, 0, List);
                            i = 1;
                        }

                    }
                    if(i == 1) {
                        ListName = null;
                    }
                });


            };
            $scope.addParameter = function() {
                if(!$scope.Lists) {
                    $scope.Lists = new Array();
                }
                $scope.Lists.push({
                    Value: "绑定值",
                    Text: "显示值"
                });
            };
            $scope.delParameter = function(List) {
                var position = $scope.Lists.indexOf(List);
                $scope.Lists.splice(position, 1);
            };
            $scope.getTableInfo = function() {
                $.post("/FormDesigner/Home/GetTable", {
                    TableName: form.DataSource
                }, function(value) {
                    var retValue = value.RetValue;
                    var tableContentItem = "<ul id='TableName'>";
                    for(var i = 0; i < retValue.length; i++) {
                        var tableInfo = retValue[i];
                        var tableItem = "<li><a href='#'>" + tableInfo.TableName + "</a>";
                        var cloumnsItem = "";
                        if(tableInfo.TableCloumns && tableInfo.TableCloumns.length > 0) {
                            cloumnsItem = "<ul>";
                            for(var j = 0; j < tableInfo.TableCloumns.length; j++) {
                                cloumnsItem = cloumnsItem + "<li><a href='#'>" + tableInfo.TableCloumns[j].Name + "</a></li>"
                            }
                            cloumnsItem = cloumnsItem + "</ul>";
                        }
                        tableContentItem = tableContentItem + tableItem + cloumnsItem + "</li>";
                    }
                    tableContentItem = tableContentItem + "</ul>";
                    $(this).after(tableContentItem);
                    $("#TableName").addClass("TableInfo");
                    $("#TableName").menu();
                    $(".ui-menu-item").css("width", "220px");

                    $("#TableName").on("menuselect", function(event, ui) {
                        if(ui.item[0].children.length == 1) $(me).val(ui.item.find("a").text());
                    });
                    $("#TableName").autocomplete({
                        source: retValue
                    });

                });
            }
        }
    }
}

function getTableInfo(me) {
    if($("#TableName").length > 0) {
        $("#TableName").remove();
    }
    var tableName = "";
    if(form && form.DataSource) tableName = form.DataSource;
    $.post("/FormDesigner/Home/GetTable", {
        TableName: tableName
    }, function(value) {
        var retValue = value.RetValue;
        var availableTags = [];
        var tableContentItem = "<ul id='TableName'>";
        if(retValue.length > 1) {
            for(var i = 0; i < retValue.length; i++) {
                var tableInfo = retValue[i];
                var tableItem = "<li><a href='#'>" + tableInfo.TableName + "</a>";
                var cloumnsItem = "";
                if(tableInfo.TableCloumns && tableInfo.TableCloumns.length > 0) {
                    cloumnsItem = "<ul>";
                    for(var j = 0; j < tableInfo.TableCloumns.length; j++) {
                        cloumnsItem = cloumnsItem + "<li><a href='#'>" + tableInfo.TableCloumns[j].Name + "</a></li>";
                        availableTags.push(tableInfo.TableCloumns[j].Name + "[" + tableInfo.TableName + "]");
                    }
                    cloumnsItem = cloumnsItem + "</ul>";
                }
                tableContentItem = tableContentItem + tableItem + cloumnsItem + "</li>";
            }
        } else if(retValue.length == 1) {
            var tableInfo = retValue[0];
            var cloumnsItem = "";
            if(tableInfo.TableCloumns && tableInfo.TableCloumns.length > 0) {
                cloumnsItem = "";
                for(var j = 0; j < tableInfo.TableCloumns.length; j++) {
                    cloumnsItem = cloumnsItem + "<li><a href='#'>" + tableInfo.TableCloumns[j].Name + "</a></li>";
                    availableTags.push(tableInfo.TableCloumns[j].Name);
                }
                cloumnsItem = cloumnsItem;
            }
            tableContentItem = tableContentItem + cloumnsItem
        }
        tableContentItem = tableContentItem + "</ul>";
        $(me).after(tableContentItem);

        $("#controlId").autocomplete({
            source: availableTags,
            open: function(event, ui) {
                if($("#TableName").length > 0) {
                    $("#TableName").hide();
                }
            },
            close: function(event, ui) {
                if($("#TableName").length > 0) {
                    $("#TableName").show();
                }
            },
            select: function(event, ui) {
                if(ui.item.value.indexOf("[") > 0) {
                    ui.item.value = ui.item.value.substring(0, ui.item.value.indexOf("["));
                }
            }
        });
        $("#TableName").menu();
        selectmenuse = 0;
        $(document).bind("click", function() {
            if(selectmenuse !== 2) {
                $("#TableName").menu("destroy");
                $("#TableName").remove();
            }
        });
        $("#TableName").addClass("TableInfo");
        $(".ui-menu-item").css("width", "210px");
        $("#TableName").on("menuselect", function(event, ui) {
            if(ui.item[0].children.length == 1) {
                $(me).val(ui.item.find("a").text());
                selectmenuse = 1;
            } else {
                selectmenuse = 2;
            }
        });
    });

}

formdesigner.dialogs.add(['CheckBox', 'Radio', 'DropDownList'], (function() {
    function initEvent(controlID, controlType) {
        var fields = form.Fields;
        var formItem={};
        for(var i = 0; i < fields.length; i++) {
            if(fields[i].Name == controlID) {
                BASE.copy(fields[i],formItem);
            }
        }
        $(".commonangular").attr("controlID", controlID);
        $(".commonangular").attr("controlType", controlType);
        $(".commonangular").attr("ng-controller", "commonoperateList");
        angular.bootstrap($(".commonangular"));
        $("#configure_tabs").tabs();
        $("#customcontent").click(function() {
            $("#dictcontent_main").find("input").each(function() {
                $(this).attr("disabled", "disabled");
            });
            $("#customcontent_main").find("input").each(function() {
                $(this).removeAttr("disabled");
            });
        });
        $("#dictcontent").click(function() {
            $("#customcontent_main").find("input").each(function() {
                $(this).attr("disabled", "disabled");
            });
            $("#dictcontent_main").find("input").each(function() {
                $(this).removeAttr("disabled");
            });
        });
        $("#save").button().click(function(event) {
            event.preventDefault();
            formdesigner.setContorlValue({
                Required: $("#required")[0].checked,
                ControlType: controlType,
                OldID: controlID,
                ID: $("#controlId").val(),
                Name: $("#controlId").val(),
                Text: $("#controlName").val(),
                DefaultValue: $("#controlValue").val(),
                DataType: $("#datatype").val(),
                AccessPattern: $("#accesspattern").val(),
                Width: $("#controlWidth").val(),
                Height: $("#controlHeight").val(),
                DataSource: $("#controlDataSource").val()
            }, true,true);
            window.parent.$("#actionDialog").dialog("close");
        });
        $("#cancel").button().click(function(event) {
            event.preventDefault();
            formItem.OldID = controlID;
            formdesigner.setContorlValue(formItem,false,true);
            window.parent.$("#actionDialog").dialog("close");
        });
        /*    $("#controlId").click(function() {
        configure.getDataSource({
            ID: this.id,
            form: form
        });
    });*/
        // angular.element(document).ready(function() {
        /*  angular.bootstrap($(".commonangular"));*/
        // });
    }

    var htmlAttr = '<div id="configure_tabs" class="commonangular">' + '<ul style="border-bottom: 0px;">' + '<li><a href="#configure_data">数据</a></li>' + '<li><a href="#configure_show">显示</a></li>' + '</ul>' + '<div id="configure_data">' + '<div>' + '<div class="data_left">字段ID</div>' + '<input type="text" class="data_right" id="controlId" />' + '</div>' + '<div style="clear: both;">' + '<div class="data_left">显示名</div>' + '<input type="text" class="data_right" id="controlName" />' + '</div>' + '<div style="clear: both; float: left;">' + '<span>数据绑定</span>' + '<div style="border-top: silver 1px solid; height: 1px; overflow: hidden"></div>' + '<div style="clear: both">' + '<div>' + '<input id="customcontent" type="radio" value="自定义内容" name="content" checked="checked">自定义内容' + '</input>' + '</div>' + '<div style="padding-left: 100px; text-align: center"' + 'id="customcontent_main">' + '<table>' + ' <tr>' + '<td style="width: 165px">绑定值</td>' + '<td style="width: 165px">显示值</td>' + '<td><span ng-click="addParameter();" class=\'btn_add\' title=\'添加\'></span></td>' + '</tr>' + '<tr ng-repeat="List in Lists">' + '<td>' + '<input type="text" ng-model="List.Value" /></td>' + '<td>' + '<input type="text" ng-model="List.Text" /></td>' + '<td><span class="btn_up" title=\'上移\' ng-click="executeOperate(List.Value+\'up$#\')"></span>' + '<span style="float: left">｜</span><span class="btn_down" title=\'下移\' ng-click="executeOperate(List.Value+\'down$#\')">' + '</span><span style="float: left">｜</span><span class=\'btn_delete\' ng-click="delParameter(List)"' + 'title="删除"></span></td>' + '</tr>' + ' </table>' + ' </div>' + '</div>' + ' <div>' + '<div>' + '<input type="radio" id="dictcontent" value="选择字典字段" name="content">选择字典字段</input>' + '</div>' + '<table style="clear: both" id="dictcontent_main">' + '<tr>' + '<td class="data_left">默认值</td>' + '<td>' + '<input type="text" id="controlValue" disabled="disabled" /></td>' + '<td class="data_left">数据源</td>' + '<td>' + '<input type="text" id="controlDataSource" disabled="disabled" /><span id="configure">' + '</span></td>' + '</tr>' + '<tr>' + '<td class="data_left">数据类型</td>' + ' <td>' + '<select id="datatype">' + '<option value="Integer" selected="selected">整数</option>' + '<option value="Float">浮点数</option>' + '<option value="DateTime">日期</option>' + '<option value="String">字符串</option>' + '<option value="Boolean">布尔型</option>' + '</select></td>' + '</tr>' + '</table>' + '</div>' + '<div style="clear: both;">' + '<div class="data_left">约束</div>' + '<input type="text" class="data_right" id="controlBind" />' + '</div>' + '<div style="clear: both;">' + '<div class="data_left">是否可为空</div>' + '<input type="checkbox" id="required" style="height: 25px; line-height: 25px;" />' + '</div>' + '</div>' + '</div>' + '<div id="configure_show" style="display: none">' + '<table>' + '<tr>' + '<td>读写状态</td>' + '<td>' + '<select id="accesspattern">' + '<option value="Write">读写</option>' + ' <option value="ReadOnly">只读</option>' + '</select></td>' + '</tr>' + ' <tr>' + '<td>宽度</td>' + '<td>' + '<input type="text" id="controlWidth" /></td>' + '</tr>' + '<tr>' + '<td>高度</td>' + '<td>' + '<input type="text" id="controlHeight" /></td>' + '</tr>' + '<tr style="display: none">' + '<td>列数</td>' + '<td>' + '<input type="text" id="controlCol" value="1" /></td>' + '</tr>' + '<tr style="display: none">' + '<td>行数</td>' + '<td>' + '<input type="text" id="controlRow" value="1" /></td>' + '</tr>' + '</table>' + '</div>' + '<div id="btnchoose">' + '<input type="button" id="save" value="确定" />' + '<input type="button" id="cancel" value="取消" />' + '</div>' + '</div>'
    var dialog = {
        dialogContent: {
            title: "配置窗口",
            width: 702,
            content: htmlAttr
        },
        dialogScript: initEvent
    };
    return dialog;
})())