var Project = window.Project;
var util = require('util');
var CBobject = CBUtil.req("js/lib/core/components/cbobject.js");
var metadata = require( "./"+__module_path__ + 'metadata.json');

function Gallery(objectdata){
  objectdata = typeof objectdata !== 'undefined' ? objectdata : {"position" : [200,200],"size":[110,110]};
  objectdata.idtype = metadata['idtype'];
  Gallery.super_.call(this,objectdata);
  this.images = typeof objectdata.images !== 'undefined' ? objectdata.images : [{"id": 1, "path": "" }] ;
}

util.inherits(Gallery,CBobject);

Gallery.prototype.editorView = function editorView() {
  var aux = Gallery.super_.prototype.editorView.call(this);
  var fs = require('fs');
  var template = fs.readFileSync("./"+__module_path__ + 'rsrc/templates/activityview.hbs',{encoding:'utf8'});
  var templatecompiled = application.util.template.compile(template);
  options={"images":this.images};
  aux.children('.cbcontainer').append($(templatecompiled(options)));
  aux.addClass('gallery');
  return aux;
};

Gallery.prototype.HTMLtags = function HTMLtags(node){
  var tagTypes = ['GALLERY'];
  var score = 0;
  if(tagTypes.indexOf(node.tagName) > -1)
    score ++;
  return score;
}

Gallery.prototype.importHTML = function importHTML(node, filePath){

}

Gallery.prototype.htmlView = function htmlView() {
  var aux = Gallery.super_.prototype.htmlView.call(this);
/*  var imagepath = this.imgpath !== null ? "rsrc/"+ this.imgpath : __module_path__ + "default.png";
  var imagepath = this.imgpath !== null ? this.imgpath : __module_path__ + "default.png";
  var imgelement = $(window.document.createElement('img')).attr('src', 'rsrc/'+imagepath);
  imgelement.css('height','100%');
  imgelement.css('width','100%');*/
  //aux.children('.cbcontainer').append(imgelement);
  return aux;
}

Gallery.prototype.pdfView = function pdfView() {
  var aux = Gallery.super_.prototype.pdfView.call(this);
  var imagepath = this.imgpath !== null ? "rsrc/"+ this.imgpath : __module_path__ + "default.png";
  var imgelement = $(window.document.createElement('img')).attr('src', imagepath);
  imgelement.css('height','100%');
  imgelement.css('width','100%');
  aux.children('.cbcontainer').append(imgelement);
  return aux;
}

Gallery.prototype.epubView = function epubView() {
  var aux = Gallery.super_.prototype.epubView.call(this);
  var projectpath=Project.Info.projectpath;
  var imagepath = this.imgpath !== null ? "file://"+projectpath + "/rsrc/"+ this.imgpath : __module_path__ + "default.png";
  var imgelement = $(window.document.createElement('img')).attr('src', imagepath);
  imgelement.css('height','100%');
  imgelement.css('width','100%');
  aux.children('.cbcontainer').append(imgelement);
  return aux;
}

Gallery.prototype.triggerAddEditorView = function triggerAddEditorView(jquerycbo,objectcbo) {
  Gallery.super_.prototype.triggerAddEditorView.call(this,jquerycbo,objectcbo);
  $(".yoxview").yoxview();
};

Gallery.prototype.clickButton = function clickButton(controllerClass) {
  var that = this;
  var dialog = $("<div class='imgdialog'><div class='content'></div><footer><div id='savedialog'><button id='save'>"+CBI18n.gettext("Save")+"</button><button id='cancel'>"+CBI18n.gettext("Cancel")+"</button></div></footer></div>");
  var template = fs.readFileSync("./"+__module_path__ + 'rsrc/templates/activityedit.hbs',{encoding:'utf8'});
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
    var voidImage = false;

    for(var i = 0; i < images.length; i++){
      if($(dialog.find("div[data-imgidentifier]")[i]).children("#imgpath").val() == "")
        voidImage = true
    }
    if(!voidImage){
      updateImages(dialog,that);
      that.calculateDimensions(that);
      controllerClass.addCBObjectIntoSelectedSection(that.editorView(),that);
      dialog.dialog('close')
    }
 });

 cancelbutton.click(function(event){
  dialog.dialog('close');
 });

dialog.dialog({dialogClass: "cbdialog",
  width: 500,
  modal:true,close:function(){$(this).remove()}});
};

Gallery.prototype.calculateDimensions = function calculateDimensions(that) {
  var newWidth = (that.images.length >= 3)? 330: that.images.length * 110;
  var newHeight = Math.ceil(that.images.length / 3) * 110;
  this.size=[newWidth,newHeight];
};

Gallery.prototype.editButton = function editButton(e) {
  var that = e.data.that;
  var dialog = Gallery.super_.prototype.editButton.call(this,e);
  dialog.dialog('option','width',500);
  var template = fs.readFileSync("./"+__module_path__ + 'rsrc/templates/activityedit.hbs',{encoding:'utf8'});
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
      updateImages(dialog,that);
      that.calculateDimensions(that);
  });

  cancelbutton.click(function(event){
    dialog.dialog('close');
  });
  dialog.callbacks.push(function(){updateImages(dialog,that);});
};
 
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
    var fs = window.require('fs');
    var fsextra = window.require('fs-extra');
    var path = window.require('path');
    var originalpath = that.images[index].path;
    var originalbasename = path.basename(originalpath);
    var finalpath = Project.Info.projectpath +"/rsrc/"+originalbasename;
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

module.exports = Gallery;
//@ sourceURL=gallery_core.js
