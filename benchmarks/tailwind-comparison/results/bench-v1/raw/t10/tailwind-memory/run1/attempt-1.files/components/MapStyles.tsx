"use client";

/**
 * Minimal subset of maplibre-gl's stylesheet, inlined so no global CSS import
 * from node_modules is needed. Contains only layout-critical rules.
 */
const CSS = `
.maplibregl-map{position:relative;overflow:hidden;font:12px/20px "Helvetica Neue",Arial,Helvetica,sans-serif;-webkit-tap-highlight-color:rgb(0 0 0/0)}
.maplibregl-canvas{position:absolute;left:0;top:0}
.maplibregl-canvas-container.maplibregl-interactive{cursor:grab;user-select:none}
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate,.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas{touch-action:pan-x pan-y}
.maplibregl-canvas-container.maplibregl-touch-drag-pan,.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas{touch-action:pinch-zoom}
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan,.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan .maplibregl-canvas{touch-action:none}
.maplibregl-marker{position:absolute;top:0;left:0;will-change:transform}
.maplibregl-popup{position:absolute;top:0;left:0;display:flex;will-change:transform;pointer-events:none}
.maplibregl-popup-anchor-bottom{flex-direction:column-reverse}
.maplibregl-popup-anchor-top{flex-direction:column}
.maplibregl-popup-anchor-left{flex-direction:row}
.maplibregl-popup-anchor-right{flex-direction:row-reverse}
.maplibregl-popup-content{position:relative;background:#fff;border-radius:10px;box-shadow:0 2px 14px rgb(0 0 0/.25);padding:10px;pointer-events:auto}
.maplibregl-popup-tip{width:0;height:0;border:10px solid transparent;z-index:1}
.maplibregl-popup-anchor-bottom .maplibregl-popup-tip{align-self:center;border-top-color:#fff;border-bottom:none}
.maplibregl-popup-anchor-top .maplibregl-popup-tip{align-self:center;border-bottom-color:#fff;border-top:none}
.maplibregl-popup-anchor-left .maplibregl-popup-tip{align-self:center;border-right-color:#fff;border-left:none}
.maplibregl-popup-anchor-right .maplibregl-popup-tip{align-self:center;border-left-color:#fff;border-right:none}
.maplibregl-ctrl-top-left,.maplibregl-ctrl-top-right,.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right{position:absolute;pointer-events:none;z-index:2}
.maplibregl-ctrl-top-left{top:0;left:0}
.maplibregl-ctrl-top-right{top:0;right:0}
.maplibregl-ctrl-bottom-left{bottom:0;left:0}
.maplibregl-ctrl-bottom-right{bottom:0;right:0}
.maplibregl-ctrl{clear:both;pointer-events:auto;transform:translate(0)}
.maplibregl-ctrl-top-right .maplibregl-ctrl{float:right;margin:10px 10px 0 0}
.maplibregl-ctrl-bottom-right .maplibregl-ctrl{float:right;margin:0 10px 10px 0}
.maplibregl-ctrl-bottom-left .maplibregl-ctrl{float:left;margin:0 0 10px 10px}
.maplibregl-ctrl-group{background:#fff;border-radius:6px;box-shadow:0 0 0 2px rgb(0 0 0/.1)}
.maplibregl-ctrl-group button{width:32px;height:32px;display:block;padding:0;border:0;background:transparent;cursor:pointer;font-size:18px;line-height:32px;color:#222}
.maplibregl-ctrl-group button+button{border-top:1px solid #ddd}
.maplibregl-ctrl-group button:hover{background:rgb(0 0 0/.05)}
.maplibregl-ctrl-icon{display:block}
.maplibregl-ctrl button .maplibregl-ctrl-icon{font-style:normal;text-align:center;font-weight:700}
.maplibregl-ctrl-attrib{background:rgb(255 255 255/.8);margin:0;padding:0 5px;font-size:11px;color:#333}
.maplibregl-ctrl-attrib a{color:rgb(0 0 0/.75);text-decoration:none}
.maplibregl-ctrl-attrib-button{display:none}
.maplibregl-ctrl-attrib-inner{display:block}
.maplibregl-compact{display:block;min-height:20px}
.maplibregl-ctrl-attrib.maplibregl-compact{border-radius:12px;margin:10px;position:relative;background:#fff;min-height:20px;padding:2px 24px 2px 0}
.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner{display:none}
.maplibregl-ctrl-attrib.maplibregl-compact-show{padding:2px 28px 2px 8px}
.maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-inner{display:block}
.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button{display:block;position:absolute;right:0;top:0;width:24px;height:24px;border:0;border-radius:12px;background:rgb(0 0 0/.15);cursor:pointer}
.maplibregl-ctrl-logo{display:none}
.maplibregl-ctrl-top-right .maplibregl-ctrl-zoom-in::before{content:"+"}
.maplibregl-ctrl-top-right .maplibregl-ctrl-zoom-out::before{content:"\\2212"}
.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon::before{content:"+"}
.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon::before{content:"\\2212"}
.maplibregl-ctrl-top-right .maplibregl-ctrl-zoom-in::before,.maplibregl-ctrl-top-right .maplibregl-ctrl-zoom-out::before{content:none}
.maplibregl-user-location-dot{display:none}
`;

export function MapStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
