// Metadata in Stardust document defined by Constellations system
//
// Constellations awared Stardust document:
//
//  <article slot="stardust">
//    <a slot="constellation-point" href="https://...">....</a>
//    <span slot="constellation-names">tag-a tag-b system:tag-c</span>
//  </article>
//
//
// Constellations awared Stardust-list page-document:
// 
//  <article slot="stardust-page">
//    <ul>
//      <li>
//        <div>
//          <a rel="stardust" slot="stardust-page-link" href="...">...</a>
//          ...
//          <a slot="constellation-point" href="https://...">....</a>
//          <span slot="constellation-names">tag-a tag-b system:tag-c</span>
//          ...
//        </div>
//      </li>
//      <li>...<li>
//    </ul>
//    <footer><a slot="stardust-page-prev" href="...">prev</a></footer>
//  </article>
//


//import * as Locator from "./bresource/modules/locator.js";

// metadata locators
export const point = `{a[slot=constellation-point]}href`;
export const names = `{[slot=constellation-names]}#list`;

