var Project = window.Project;
var util = require('util');
var CBobject = CBUtil.req("js/lib/core/components/cbobject.js");
var metadata = require( "./"+__module_path__ + 'metadata.json');

function Gallery(objectdata){
  var defaultValues = {
        idtype : metadata['idtype'],
        position : [200,200],
        size:[110,110]
      };

  objectdata = $.extend({},defaultValues,objectdata);
  Gallery.super_.call(this,objectdata);
  this.images = typeof objectdata.images !== 'undefined' ? objectdata.images : [{"id": 1, "path": "" }, {"id": 2, "path": "" }] ;
}

util.inherits(Gallery,CBobject);

Gallery.prototype.editorView = function editorView() {
  var aux = Gallery.super_.prototype.editorView.call(this);
  aux = this.appendTemplate(aux, 'rsrc/templates/galleryview.hbs');
  return aux;
};

Gallery.prototype.HTMLtags = function HTMLtags(node){
  var tagTypes = ['GALLERY'],
      score = 0;

  if(tagTypes.indexOf(node.tagName) > -1)
    score ++;

  return score;
}

Gallery.prototype.importHTML = function importHTML(node, filePath){

}

Gallery.prototype.htmlView = function htmlView() {
  var aux = Gallery.super_.prototype.htmlView.call(this);
  aux = this.appendTemplate(aux, 'rsrc/templates/galleryview.hbs');
  return aux;
}

Gallery.prototype.appendTemplate = function appendTemplate(element, templateName) {
  var fs = require('fs'),
      template = fs.readFileSync("./"+__module_path__ + templateName,{encoding:'utf8'}),
      templatecompiled = application.util.template.compile(template), 
      options={"images":this.images};

    element.children('.cbcontainer').append($(templatecompiled(options)));
    element.addClass('gallery');

    return element;
}

Gallery.prototype.pdfView = function pdfView() {
  return this.epubView();
}

Gallery.prototype.epubView = function epubView() {
  var aux = Gallery.super_.prototype.epubView.call(this);
  aux = this.appendTemplate(aux, 'rsrc/templates/galleryepub.hbs');
  return aux;
}

Gallery.prototype.triggerAddEditorView = function triggerAddEditorView(jquerycbo,objectcbo) {
  Gallery.super_.prototype.triggerAddEditorView.call(this,jquerycbo,objectcbo);
  $(".yoxview-thumbnails").yoxview({
    buttonsFadeTime: 0,
    renderInfoPin:false,
    lang: getLanguage(process.env.LANG)
  });
};

Gallery.prototype.triggerHTMLView = function triggerHTMLView() {
  return '$(document).ready(function(){ ' +
  'var yoxlang = (function(){ ' +
    'var enviromentLang = navigator.language;' +
    getLanguage.toString() + 
    'return getLanguage(enviromentLang)' + 
  '})();'+
  ' $(".yoxview-thumbnails").yoxview({'+
          ' buttonsFadeTime: 0, ' +
          ' renderInfoPin:false ,' + 
          ' lang: yoxlang });})';
};


Gallery.prototype.clickButton = function clickButton(controllerClass) {
  var that = this,
  dialog = $("<div class='imgdialog'><div class='content'></div><footer><div id='savedialog'><button id='save'>"+CBI18n.gettext("Save")+"</button><button id='cancel'>"+CBI18n.gettext("Cancel")+"</button></div></footer></div>"),
  template = fs.readFileSync("./"+__module_path__ + 'rsrc/templates/galleryedit.hbs',{encoding:'utf8'});
  var templatecompiled = application.util.template.compile(template);
  dialog.children(".content").append(templatecompiled({'images':that.images}));
  var images = dialog.find("#listimages");
  var addbutton = dialog.find("#addimage");
  var gallerytemplate =  '<div data-imgidentifier="{{this.id}}"><input id="imgpath" type="file" style="display: inline-block;"/><button type="button" onclick="deleteImage(this)" style="display: inline-block;">{{gettext "Delete"}}</button></div>';
  var gallerytemplatecompiled = application.util.template.compile(gallerytemplate);
  var savebutton = dialog.find("#save");
  var cancelbutton = dialog.find("#cancel");

  addbutton.click(function(event) {
    var last = $("#listimages").children().last();
    var identifier = last.attr("data-imgidentifier") == undefined?1:Number(last.attr("data-imgidentifier")) + 1;
    last.children().length == 0?$("#listimages").append(gallerytemplatecompiled({'id':identifier})):last.after(gallerytemplatecompiled({'id':identifier}));
  });

 savebutton.click(function(event){
    var images = dialog.find("div[data-imgidentifier]");
    if($(dialog.find("div[data-imgidentifier]")).length <2){
      dialog.find('.ErrorCreation2').css("display", "inline");
      dialog.find('.ErrorCreation').css("display", "none");
    }
    else
    {
      dialog.find('.ErrorCreation2').css("display", "none");
      if(!checkVoidImages(dialog)){
        updateImages(dialog,that);
        that.calculateDimensions();
        controllerClass.addCBObjectIntoSelectedSection(that.editorView(),that);
        dialog.find('.ErrorCreation').css("display", "none");
        dialog.dialog('close')
      }
      else
        dialog.find('.ErrorCreation').css("display", "inline");
    }
 });

 cancelbutton.click(function(event){
  dialog.dialog('close');
 });

dialog.dialog({dialogClass: "cbdialog",
  width: 500,
  modal:true,close:function(){$(this).remove()}});
};

Gallery.prototype.calculateDimensions = function calculateDimensions() {
  var newWidth = (this.images.length >= 3)? 330: this.images.length * 110;
  var newHeight = Math.ceil(this.images.length / 3) * 110;
  this.size=[newWidth,newHeight];
};

Gallery.prototype.editButton = function editButton(e) {
  var that = e.data.that;
  var dialog = Gallery.super_.prototype.editButton.call(this,e);
  dialog.dialog('option','width',500);
  var template = fs.readFileSync("./"+__module_path__ + 'rsrc/templates/galleryedit.hbs',{encoding:'utf8'});
  var templatecompiled = application.util.template.compile(template);
  dialog.children(".content").append(templatecompiled({'images':that.images}));
  dialog.find("#save").unbind("click");
  var images = dialog.find("#listimages");
  var addbutton = dialog.find("#addimage");
  var gallerytemplate =  '<div data-imgidentifier="{{this.id}}"><input id="imgpath" type="file" style="display: inline-block;"/><button type="button" onclick="deleteImage(this)" style="display: inline-block;">{{gettext "Delete"}}</button></div>';
  var gallerytemplatecompiled = application.util.template.compile(gallerytemplate);
  var savebutton = dialog.find("#saveButton");
  var cancelbutton = dialog.find("#cancel");

  addbutton.click(function(event) {
    var last = $("#listimages").children().last();
    var identifier = last.attr("data-imgidentifier") == undefined?1:Number(last.attr("data-imgidentifier")) + 1;
    last.children().length == 0?$("#listimages").append(gallerytemplatecompiled({'id':identifier})):last.after(gallerytemplatecompiled({'id':identifier}));
  });

  dialog.find("#save").click(function(event){
    if($(dialog.find("div[data-imgidentifier]")).length <2){
      dialog.find('.ErrorCreation2').css("display", "inline");
      dialog.find('.ErrorCreation').css("display", "none");
    }
    else
    {
      dialog.find('.ErrorCreation2').css("display", "none");
      if(!checkVoidImages(dialog)){
        updateImages(dialog,that);
        that.calculateDimensions();
        $('[data-cbobjectid="' + that.uniqueid + '"]').width(that.size[0]);
        $('[data-cbobjectid="' + that.uniqueid + '"]').height(that.size[1]);
         dialog.find('.ErrorCreation').css("display", "none");
         var viewobject = $("[data-cbobjectid='"+that.uniqueid+"']");
         viewobject.replaceWith(that.editorView());
         that.triggerAddEditorView($("[data-cbobjectid='"+that.uniqueid+"']"),that);
         var CBStorage = application.storagemanager.getInstance();
         CBStorage.setCBObjectById(that,that.uniqueid);
         dialog.remove() ;
         $('#savedialog').dialog('destroy');
         $(".cbtextbox-toolbar").remove();
         $('body').click({that:that},that.disableEditMode);
      }
      else
        dialog.find('.ErrorCreation').css("display", "inline");
    }
  });
};

function checkVoidImages(dialogElement)
{
  var voidImage = false;

    for(var i = 0; i < $(dialogElement.find("div[data-imgidentifier]")).length; i++){
      if(($(dialogElement.find("div[data-imgidentifier]")[i]).children("#imgpath").val() == "") && 
        ($(dialogElement.find("div[data-imgidentifier]")[i]).children("#imgpath").attr("value") == "" || $(dialogElement.find("div[data-imgidentifier]")[i]).children("#imgpath").attr("value") == undefined))
        voidImage = true
    }
    return voidImage;
} 

function updateImages(dialog,objectcbo){
  objectcbo.images = [];
  var images = dialog.find("div[data-imgidentifier]");

  for(var i = 0; i < images.length; i++){
    objectcbo.images.push({"id": $(images[i]).attr("data-imgidentifier"), 
      "path": $(dialog.find("div[data-imgidentifier]")[i]).children("#imgpath").val() != ""?$(dialog.find("div[data-imgidentifier]")[i]).children("#imgpath").val():
      $(dialog.find("div[data-imgidentifier]")[i]).children("#imgpath").attr("value")});
    updateImagePath(i,objectcbo)
  }
}

function updateImagePath(index, that){
    var fs = window.require('fs'),
        fsextra = window.require('fs-extra'),
        path = window.require('path'),
        originalpath = that.images[index].path,
        originalbasename = path.basename(originalpath),
        finalpath = Project.Info.projectpath +"/rsrc/"+originalbasename;

    while(true){
      try{
        fs.accessSync(finalpath);
        originalbasename = "0"+originalbasename;
        finalpath = Project.Info.projectpath + "/rsrc/"+ originalbasename;
      }
      catch(e){
        break;
      }
    }
    fsextra.copySync(originalpath,finalpath);
    that.images[index].path = finalpath;
}

function getLanguage(enviromentLang){
  if(enviromentLang.indexOf("@") !== -1 ){
    if(enviromentLang.indexOf("valencia")){
      return "ca-es-valencia";
    }
  }
  else if(enviromentLang.indexOf("zh") === 0){
    if(enviromentLang.indexOf("tw")){
      return "zh-tw"
    }
    return "zh-cn";
  }
  return enviromentLang.substr(0,2);
}


module.exports = Gallery;
//@ sourceURL=gallery_core.js
