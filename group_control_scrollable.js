// il faut etendre groupLayer pour avoir un control dessus

L.LayerGroup.Essai = L.LayerGroup.extend({
    options: {
        name: 'unnamed'
    },
    //quand le group est cree on doit creer un control
    initialize: function(options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.setOptions(this, options);
        this._control = L.control.layers.essaiControl(this);
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

L.layerGroup.essai = function(opts) {
    return new L.LayerGroup.Essai(opts);
}

// Ce control permet d'afficher la liste des elements du groupe.
// Quand on passe la souris sur un element, un cadre apparaît pour le
// mettre en valeur.

L.Control.Layers.EssaiControl = L.Control.Layers.extend({

    initialize: function(layerGroup){
        this.layerGroup = layerGroup;
        L.Control.Layers.prototype.initialize.call(this);
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
        this.layerGroup.eachLayer(function (layer) {
            var tr = L.DomUtil.create('tr', null, table);
            var td = L.DomUtil.create('td', null, tr);
            //c'est pas beau mais on utilise une option label inutilisee
            //pour chaque layer A CHANGER
            if (layer.options.label) {
                td.innerText = layer.options.label;
            } else {
                td.innerText = 'unlabelled';
            }
            //td.innerHTML = "blop";
            //gestion des events
            var classList = null;
            if (layer instanceof L.Path) {
                classList = layer._path.classList;
            } else if (layer instanceof L.Marker) {
                classList = layer._icon.classList;
            }
            if (classList) {
                tr.onmouseover = function() {
                    classList.add('selected_outline');
                }
                tr.onmouseout = function() {
                    classList.remove('selected_outline');
                }
            }
        });
    }
});

L.control.layers.essaiControl = function(layerGroup) {
    return new L.Control.Layers.EssaiControl(layerGroup);
}
