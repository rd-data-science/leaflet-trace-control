// NOTE: supprimer L.LayerGroup.Trace et ajouter des listeners sur le layer
// associer au L.Control.Layers.traceControl.
// Des lors quand le layer est ajouter on montre le control, sinon on 
// l'enleve. Ce sera plus propore en gardant le meme comportement et on ne
// sera plus oblige de differencier dans le code generate_trace_control si
// il y a layer ou pas
//
// NOTE2: Ajouter un listener sur le contenu du layer pour que même si on
// ajoute le control avant les composants du groupe, il se mette a jour
// quand meme ?


// il faut etendre groupLayer pour avoir un control dessus

L.LayerGroup.Trace = L.LayerGroup.extend({
    options: {
        name: 'unnamed',
        collapsed: true,
    },
    //quand le group est cree on doit creer un control
    initialize: function(options) {
        L.LayerGroup.prototype.initialize.call(this);
        //this.on('layeradd', function(){console.log('iciii');});
        L.setOptions(this, options);
        this._control = L.control.layers.traceControl(this, this.options);
        //this._control.addTo(map);
    },
    //quand le group est affiche, on doit afficher le control
    onAdd: function(map) {
        L.LayerGroup.prototype.onAdd.call(this, map);
        this._control.addTo(map);

    },
    //quand le group est enleve on doit supprimer le control
    onRemove: function(map) {
        this._control.remove(map);
        L.LayerGroup.prototype.onRemove.call(this, map);
    }
});

L.layerGroup.trace = function(opts) {
    return new L.LayerGroup.Trace(opts);
}

// Ce control permet d'afficher la liste des elements du groupe.
// Quand on passe la souris sur un element, un cadre apparaît pour le
// mettre en valeur.

L.Control.Layers.TraceControl = L.Control.Layers.extend({

    initialize: function(layerGroup, options){
        this.layerGroup = layerGroup;
        L.Control.Layers.prototype.initialize.call(this);
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        this._initLayout();
        return this._container;
    },

    _initLayout: function() {
        L.Control.Layers.prototype._initLayout.call(this);
        //modification de l'icone quand le control est collapsed
        var icon = this._layersLink;
        L.DomUtil.setClass(icon, 'traceControlToggle');
        icon.innerHTML = this.layerGroup.options.name;
        //remplissage du control
        var table = L.DomUtil.create('table', 'hoverTable', this._form);
        L.DomUtil.addClass(this._form, 'hiddenOverflowX');
        //this.on('layeradd', function(){console.log('bl');});
        //console.log(this);
        //for (let layer of this.layerGroup.getLayers()){
        //layer.addEventParent(this);
        //    console.log('la');
        //    console.log(layer);
        //    layer.on('overlayadd', function(){console.log('par la');});
        //}
        this.layerGroup.eachLayer(function (layer) {
            //layer.on('layerremove', function(){console.log('bl');});
            //console.log(this);
            //layer.addEventParent(this);
            //console.log(layer);
            var tr = L.DomUtil.create('tr', null, table);
            var td = L.DomUtil.create('td', null, tr);
            //c'est pas beau mais on utilise une option label inutilisee
            //pour chaque layer A CHANGER
            //console.log(layer.options.label);
            if (layer.options.label) {
                td.innerText = layer.options.label;
            } else {
                td.innerText = 'unlabelled';
            }
            //td.innerHTML = "blop";
            //gestion des events
            tr.onmouseover = function() {
                for (let classList of _selectOutline(layer)) {
                    classList.add('selected_outline');
                }
            }
            tr.onmouseout = function() {
                for (let classList of _selectOutline(layer)) {
                    classList.remove('selected_outline');
                }
            }
        });
    }

});

function* _selectOutline(layer) {
    var classList = null;
    if (layer instanceof L.Path) {
        if (layer._path != null) {
            yield layer._path.classList;
        }
    } else if (layer instanceof L.Marker) {
        if (layer._icon != null) {
            yield layer._icon.classList;
        }
    } else if (layer instanceof L.LayerGroup) {
        for (let lay of layer.getLayers()) {
            yield* _selectOutline(lay);
        }
    }
}

function* _iterateLayers(layer) {
    if (layer instanceof L.LayerGroup) {
        for (let lay of layer.getLayers()) {
            yield* _iterateLayers(lay);
        }
    } else {
        yield layer;
    }
}

L.control.layers.traceControl = function(layerGroup, options) {
    return new L.Control.Layers.TraceControl(layerGroup, options);
}
