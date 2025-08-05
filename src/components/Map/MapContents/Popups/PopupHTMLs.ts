import { defaultFunction, defaultFunctionPerson, defaultPerson, markerFnIndex } from '../Variables/Variables';
import styles from '../_MapContents.module.scss';
import ICON_USER from '@/assets/icons/Black_Icon/64X64/Person-01.png';
import ARROW_ICON from '@/assets/icons/arrow-icon.png';

// Right-click menu on Function Marker
export const fnPopupHTML = (name: string, type: boolean, error: string, hasBoundary: boolean, isFlashing: boolean): string => {
  return `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${styles['row']} ${styles['on-hover-rename']}">
        Function Type
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles["hover-func"]}">
          <div 
            class="${name.startsWith('Function') && styles['disable']}" 
            ${!name.startsWith('Function') && `onclick="edittingItem('black', 'Function')"`}
          >
            Function with index
          </div>
          <div 
            class="${name.startsWith('eFunction') && styles['disable']}" 
            ${!name.startsWith('eFunction') && `onclick="edittingItem('black', 'eFunction', eFunction)"`}
          >
            eFunction with index
          </div>
          <div 
            class="${name.startsWith('aFunction') && styles['disable']}" 
            ${!name.startsWith('aFunction') && `onclick="edittingItem('black', 'aFunction ', aFunction)"`}
          >
            aFunction with index
          </div>
          <div 
            class="${name.startsWith('Natural') && styles['disable']}" 
            ${!name.startsWith('Natural') && `onclick="edittingItem('black', 'Natural function', natural)"`}
          >
            Natural function
          </div>
          <div 
            class="${name.startsWith('Non-natural') && styles['disable']}" 
            ${!name.startsWith('natural') && `onclick="edittingItem('black','Non-natural function', nonNatural)"`}
          >
            Non-natural function
          </div>
          <div 
            class="${name.startsWith('Added') && styles['disable']}" 
            ${!name.startsWith('Added') && `onclick="edittingItem('black', 'Added Function', addedFunction)"`}
          >
            Added Function with index
          </div>
          <div 
            class="${name.startsWith('Existing') && styles['disable']}" 
            ${!name.startsWith('Existing') && `onclick="edittingItem('black', 'Existing Function', existingFunction)"`}
          >
            Existing Function with index
          </div>
          <div 
            class="${name.startsWith('u\nn\n(t)') && styles['disable']}" 
            ${!name.startsWith('u\nn\n(t)') && `onclick="edittingItem('black', 'u<sub>n</sub>(t)', UnT)"`}
          >
            u<sub>n</sub>(t)
          </div>
          <div 
            class="${name.startsWith('h\nn\n(t)') && styles['disable']}" 
            ${!name.startsWith('h\nn\n(t)') && `onclick="edittingItem('black', 'h<sub>n</sub>(t)', HnT)"`}
          >
            h<sub>n</sub>(t)
          </div>
        </div>
      </div>
    
      <div class="${styles['row']}" onclick="openRenameModal()">
        Rename
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Add
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="fnAddImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="fnAddAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="fnAddVideo(event)" />
          </div>
        </div>
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Replace Function with
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="replaceFnWithImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="replaceFnWithAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="replaceFnWithVideo(event)" />
          </div>
        </div>
      </div>
      
      <div class="${styles['row']} ${styles['on-hover']}" onclick="edittingItem('red','Problem')">
        Replace Function by Problem
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Function Execution
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func-block']}">
          <div onclick="edittingItem('green')">
            ${type ? 'Normal': 'Positive'}
          </div>
          <div onclick="edittingItem('red')">
            ${type ? 'Abnormal' : 'Negative'}
          </div>
        </div>
      </div>

      <div 
        onclick="handleAddProblem(problem)" 
        style="display:${error ? 'auto': 'none'}"
        class="${styles['row']}"
      >
      Identify as Solution
      </div>

      <div class="${styles['row']}" onclick="changeToStopFunction()">
        Change to Stop Function
      </div>

      <div class="${styles['row']}" onclick="changeToTemporaryFunction()">
        Change to Temporary Function
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Show Function
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func']}">
          <div 
            onclick="changeShape('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div 
            onclick="changeShape('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div 
            onclick="changeShape('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>
      
      <div 
        onclick="handleToggleFlasingFn()" 
        class="${styles['row']}"
      >
        ${isFlashing ? 'Stop Changing Function State' : 'Change Function State'}
      </div>

      <div 
        onclick="handleToggleBoundaryFn()" 
        class="${styles['row']}"
      >
        ${hasBoundary ? 'Hide Function Boundary' : 'Show Function Boundary'}
      </div>

      <div 
        onclick="deleteItem()" 
        class="${styles['row']}"
      >
        Delete
      </div>
    </div>
  `;
}

// Right-click menu on Person Marker
export const personPopupHTML = (): string => {
  return `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div onclick="openRenameModal()" class="${styles['row']}">
        Rename
      </div>
      <div class="${styles['row']} ${styles['upload-file-wrapper']}">
        Upload your image
        <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="setProfile(event)" />
      </div>
      <div class="${styles['row']} ${styles['on-hover']}">
        Mobility
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
         <div class="${styles['hover-func-block']}">
          <div onclick="showMoveWithPath()" class="${styles['upload-file-wrapper']}">
            Show Move With Path
          </div>
          <div onclick="showMoveWithoutPath()" class="${styles['upload-file-wrapper']}">
            Show Move Without Path
          </div>
          <div onclick="showMoveWithPathGivenSet()" class="${styles['upload-file-wrapper']}">
            Show Move With Path With The Given Set
          </div>
          <div onclick="showMoveWithoutPathGivenSet()" class="${styles['upload-file-wrapper']}">
            Show Move Without Path With The Given Set
          </div>
        </div>
      </div>
      <div class="${styles['row']} ${styles['on-hover']}">
        Relationship
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
         <div class="${styles['hover-func-block']}">
          <div onclick="addRelatePerson('Person')" class="${styles['upload-file-wrapper']}">
            Person and Person
          </div>
          <div onclick="addRelatePerson('Given Set')" class="${styles['upload-file-wrapper']}">
            Person and Given Set
          </div>
          <div onclick="addRelatePerson('Person Aspect')" class="${styles['upload-file-wrapper']}">
           Person and Person Aspect
          </div>
          <div onclick="addRelatePerson('Principle Aspect')" class="${styles['upload-file-wrapper']}">
            Person and Principle Aspect
          </div>
          <div 
            onclick="addRelatePerson('Personal Responsibility')"
            class="${styles['upload-file-wrapper']}"
          >Personal Responsibility</div>
          <div 
            onclick="addRelatePerson('Self - Contribution')"
            class="${styles['upload-file-wrapper']}"
          >Self - Contribution</div>
          <div 
            onclick="addRelatePerson('Averaging')"
            class="${styles['upload-file-wrapper']}"
          >Averaging</div>
          <div 
            onclick="addRelatePerson('Feedback')"
            class="${styles['upload-file-wrapper']}"
          >Feedback</div>
          <div 
            onclick="addRelatePerson('Correction')"
            class="${styles['upload-file-wrapper']}"
          >Correction</div>
          <div 
            onclick="addRelatePerson('Function Boundary')"
            class="${styles['upload-file-wrapper']}"
          >Function Boundary</div>
        </div>
      </div>
      <div 
        onclick="deleteItem()" 
        class="${styles['row']}"
      >
        Delete
      </div>
    </div>
  `;
}

// Right-click menu on Person Marker
export const personMobilityPopupHTML = (): string => {
    return `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${styles['row']} ${styles['on-hover']}">
        Mobility
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
         <div class="${styles['hover-func-block']}">
          <div onclick="showMoveWithPath()" class="${styles['upload-file-wrapper']}">
            Show Move With Path
          </div>
          <div onclick="showMoveWithoutPath()" class="${styles['upload-file-wrapper']}">
            Show Move Without Path
          </div>
          <div onclick="showMoveWithPathGivenSet()" class="${styles['upload-file-wrapper']}">
            Show Move With Path With The Given Set
          </div>
          <div onclick="showMoveWithoutPathGivenSet()" class="${styles['upload-file-wrapper']}">
            Show Move Without Path With The Given Set
          </div>
        </div>
      </div>
      <div 
        onclick="deleteItem()" 
        class="${styles['row']}"
      >
        Delete
      </div>
    </div>
  `;
}

export const rectPopupHTML = (listCountry: any): string => {
    return `
    <div className={styles.rectIcon}>
            <div className={styles.rectangularList}>
                {listCountry.map(item => <RectangularItem key={item} countryName={item}/>)}
                <div className={styles.divPlus}>
                    <button className={styles.plus} id='plus'>
                        +
                    </button>
                </div>
            </div>
        </div>
  `;
}

// Right-click menu on Group Marker
export const groupPopupHTML = (): string => {
  return `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${styles['row']} ${styles['on-hover-rename']}">
        Group Function Type
        <div class="${styles['hover-func']}">
          <div>Group Function with Index</div>
          <div>Group eFunction with Index</div>
          <div>Group aFunction with Index</div>
          <div>Group Natural Function</div>
          <div>Group Non-Natural Function</div>
          <div>Group Added Function with Index</div>
          <div>Group Existing Function with Index</div>
        </div>
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Show Group Function
        <div class="${styles['hover-func']}">
          <div 
            onclick="changeShapeOption('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div 
            onclick="changeShapeOption('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div 
            onclick="changeShapeOption('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Replace Group with
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="replaceGroupWithImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="replaceGroupWithAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="replaceGroupWithVideo(event)" />
          </div>
        </div>
      </div>

      <div onclick="deleteGroup()" class="${styles['row']}">
        Delete
      </div>
    </div>
  `
}

export const mainsetPopupHTML = (): string => {
  return `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
        <div onclick="insertHorizontalLine()" class="${styles['row']}">
          Insert Principle Line
        </div>
        <div onclick="deleteMainSet()" class="${styles['row']}">
          Delete Main Set
        </div>
    </div>
  `
}

// Right-click on solution / problem function marker 
export const problemPopupHTML = (hasBoundary: boolean): string => {
  return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${[styles['row']]} ${styles['on-hover']}">
        Show Problem as
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func']}">
          <div
            onclick="changeShapeProblem('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div
            onclick="changeShapeProblem('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div
            onclick="changeShapeProblem('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>
      <div class="${styles['row']} ${styles['on-hover']}" onclick="replaceProblemToFn()">
        Replace Problem by Function
      </div>
      <div 
        onclick="deleteItem()"
        class="${styles['row']}"
      >
        Delete
      </div>
    </div>
  `

  // <div 
  //   onclick="handleToggleBoundaryFn()" 
  //   class="${styles['row']}"
  // >
  //   ${hasBoundary ? 'Hide Function Boundary' : 'Show Function Boundary'}
  // </div>
}

// Children function markers inside function group 
export const groupFnLayoutPopupHTML = (group: any[]): string => {
  return `
    <div class="${styles['group-function']}">
      ${group.map(item => {
        let className = styles['rectangle-fn-gr'];
        if (item.shape === 'circle') {
          className = styles['circle-fn-gr'];
        }
        else if (item.shape === 'ellipse') {
          className = styles['ellipse-fn-gr'];
        }
        return `
          <div class="${className} ${styles['fn--black']}">
            Function ${item.index}
          </div>
        `
      })
      .join("")}
    </div>
  `;
};

// Children person markers inside person group 
export const groupPersonLayoutPopupHTML = (group: any[]): string => {
  return `
    <div class="${styles['group-function']}">
      ${group.map(item => {
        return `
          <div style="margin-right: 6px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <img src="${ICON_USER.src}" alt="Person" width="40" height="40" />
            <div style="font-size: 0.813rem;">Person ${item}</div>
          </div>
        `
      })
      .join("")}
    </div>
  `
}

// Popup appears when using CTRL or Area Selection to choose markers
export const wrappingPopupHTML = (restrictPopup: number): string => {
  return `
    <div 
      onclick="closePopupScan()"
      style="background-color:#fff; padding:10px; min-width:100px; padding-right: 40px; display: flex; justify-content: space-between;" 
    >
      ${restrictPopup < 1 
        ? `
          <div 
            class='group-button' 
            onclick='getSelectedList(event)'
          > 
            Group
          </div>
          <div 
            class='group-button' 
            onclick='addToMainSet(event)'
          > 
            Main Set
          </div>
        `
        : ''
      }
      <div
        class='group-button'
        onclick='handleShowDistance()'
      >
        Show Distance
      </div>
      <div 
        class='group-button' 
        onclick='handleRemoveTempList()'
      >
        Cancel
      </div>
    </div>
  `
}

// Right-click on world map
export const worldPopupHTML = (): string => {
  return `
    <div
      class="${styles['popup-interact-function']} ${styles['popup-wrap']}"
    >
      <div class="${styles['row']} ${styles['on-hover']} world">
        Show World as House
      </div>
      <div class="${styles['row']} ${styles['on-hover']} country">
        Show All Countries as House
      </div>
      <div class="${styles['row']} ${styles['on-hover']} map-element">
        Map Element
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles['hover-func-block']}">
          <div 
            onclick="handleSelectMapElement('Personal Responsibility')"
            class="${styles['upload-file-wrapper']}"
          >Personal Responsibility</div>
          <div 
            onclick="handleSelectMapElement('Self - Contribution')"
            class="${styles['upload-file-wrapper']}"
          >Self - Contribution</div>
          <div 
            onclick="handleSelectMapElement('Averaging')"
            class="${styles['upload-file-wrapper']}"
          >Averaging</div>
          <div 
            onclick="handleSelectMapElement('Feedback')"
            class="${styles['upload-file-wrapper']}"
          >Feedback</div>
          <div 
            onclick="handleSelectMapElement('Correction')"
            class="${styles['upload-file-wrapper']}"
          >Correction</div>
          <div 
            onclick="handleSelectMapElement('Function Boundary')"
            class="${styles['upload-file-wrapper']}"
          >Function Boundary</div>
        </div>
      </div>
    </div>
  `
}

export const boatPopupHTML = (): string => {
    return `
    <div
      class="${styles['popup-interact-function']} ${styles['popup-wrap']}"
    >
      <div class="${styles['row']} ${styles['on-hover']} world">
        Show World as Boat
      </div>
      <div class="${styles['row']} ${styles['on-hover']} country">
        Show All Countries as Boat
      </div>
      <div class="${styles['row']} ${styles['on-hover']} map-element">
        Map Element
        <div class="${styles['hover-func-block']}">
          <div 
            onclick="handleSelectMapElement('Personal Responsibility')"
            class="${styles['upload-file-wrapper']}"
          >Personal Responsibility</div>
          <div 
            onclick="handleSelectMapElement('Self - Contribution')"
            class="${styles['upload-file-wrapper']}"
          >Self - Contribution</div>
          <div 
            onclick="handleSelectMapElement('Averaging')"
            class="${styles['upload-file-wrapper']}"
          >Averaging</div>
          <div 
            onclick="handleSelectMapElement('Feedback')"
            class="${styles['upload-file-wrapper']}"
          >Feedback</div>
          <div 
            onclick="handleSelectMapElement('Correction')"
            class="${styles['upload-file-wrapper']}"
          >Correction</div>
          <div 
            onclick="handleSelectMapElement('Function Boundary')"
            class="${styles['upload-file-wrapper']}"
          >Function Boundary</div>
        </div>
      </div>
    </div>
  `
}


// Right-click on house marker
export const housePopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']}">
      <div 
        onclick="deleteHouse()"
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Delete Item
      </div>
    </div>
  `
}

// Right-click on welcome-sign marker
export const welcomeSignPopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']}">
      <div 
        onclick="deleteWelcome()"
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Delete Item
      </div>
    </div>
  `
}

// Right click on inter-route marker
export const routePopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']}">
      <div 
        onclick="changeRoute()" 
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Change
      </div>
      <div 
        onclick="deleteInterRoute()" 
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Delete Item
      </div>
    </div>
  `
}

// Right click on distance marker
export const distancePopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']}">
      <div 
        onclick="changeDistance()" 
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Change
      </div>
      <div 
        onclick="deleteDistanceLine()" 
        class="${styles['menu-geojson']} ${styles['on-hover-function']}"
      >
        Delete Item
      </div>
    </div>
  `
}

// Right click on country map
export const countryModePopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']}">
      <div 
        onclick ="handleAddFunction(event)" 
        class="${styles["menu-geojson"]} ${styles["on-hover-function"]}"
      >
        Function
        <div class="${styles["sub-icon"]}" style="float: right">
            <img src="${ARROW_ICON.src}" alt="Arrow" width="15" height="15" />
        </div>
        <div class="${styles["hover-func"]}">
          <div onclick="handleAddFunction(event, 'Natural function', natural)">
            Natural function
          </div>
          <div onclick="handleAddFunction(event, 'Non-natural function', nonNatural)">
            Non-natural function
          </div>
          <div onclick="handleAddFunction(event, 'Added function', addedFunction)">
            Added function
          </div>
          <div onclick="handleAddFunction(event, 'Existing function', existingFunction)">
            Existing function
          </div>
        </div>
      </div>
      <h3 
        onclick="handlePopulateFn('function', ${defaultFunction[0]})" 
        class=${styles["menu-geojson"]}
      >
        Populate Function
      </h3>
      <h3 
        onclick="handlePopulateFn('person', ${defaultPerson[0]})" 
        class=${styles["menu-geojson"]}
      >
        Populate Person
      </h3>
      <h3 
        onclick="handlePopulateFn('function-person', ${defaultFunctionPerson[0]})" 
        class=${styles["menu-geojson"]}
      >
        Populate Person & Function
      </h3>
      <h3 
        onclick="openPopulateModal()" 
        class=${styles["menu-geojson"]}
      >
        Populate Property
      </h3>
      <h3 
        onclick="makeGroupFromCountry('function')" 
        class=${styles["menu-geojson"]}
      >
        Group Function
      </h3>
      <h3 
        onclick="makeGroupFromCountry('person')" 
        class=${styles["menu-geojson"]}
      >
        Group Person
      </h3>
      <h3 
        onclick="handleAddProblem('problem')" 
        class=${styles["menu-geojson"]}
      >
        Problem
      </h3>
      <h3 
        onclick="handleAddProblem('solution')" 
        class=${styles["menu-geojson"]}
      >
        Solution
      </h3>
      <h3
        onclick="handleShowSingleFunction()" 
        class=${styles["menu-geojson"]}
      >
        Show Country as Single Function
      </h3>
      <h3
        onclick="handleShowGroupFunction()" 
        class=${styles["menu-geojson"]}
      >
        Show Country as Group Function
      </h3>
    </div>
  `
}

export const countryFnPopupHTML = (): string => {
  return `
    <div class="${styles['popup-wrap']} ${styles['popup-interact-function']}">
      <div class="${[styles['row']]} ${styles['on-hover']}">
        Show Function
        <div class="${styles['hover-func']}">
          <div
            onclick="changeShapeCountryFn('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div
            onclick="changeShapeCountryFn('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div
            onclick="changeShapeCountryFn('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>
      <div 
        onclick="openRenameCountryModal()" 
        class="${styles['row']}"
      >
        Change Name of Function
      </div>
      <div 
        onclick="openChangeSizeCountryModal()" 
        class="${styles['row']}"
      >
        Change Size of Function
      </div>
      <div 
        onclick="deleteCountryFn()" 
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}

export const stopFnPopupHTML = (): string => {
  return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${[styles['row']]} ${styles['on-hover']}">
        Show Function
        <div class="${styles['hover-func']}">
          <div
            onclick="changeShapeStopFn('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div
            onclick="changeShapeStopFn('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div
            onclick="changeShapeStopFn('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>
      <div 
        onclick="deleteStopFn()"
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}

export const tempFnPopupHTML = (): string => {
  return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${[styles['row']]} ${styles['on-hover']}">
        Show Function
        <div class="${styles['hover-func']}">
          <div
            onclick="changeShapeTempFn('circle')"
            class="${styles['black']} ${styles['color-circle']}"
          ></div>
          <div
            onclick="changeShapeTempFn('ellipse')"
            class="${styles['black']} ${styles['color-ellipse']}"
          ></div>
          <div
            onclick="changeShapeTempFn('rectangle')"
            class="${styles['black']} ${styles['color-rectangle']}"
          ></div>
        </div>
      </div>
      <div 
        onclick="deleteTempFn()"
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}

export const floorPopupHTML = (): string => {
    return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${styles['row']} ${styles['on-hover']}">
        Add
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="roomAddImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="roomAddAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="roomAddVideo(event)" />
          </div>
        </div>
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Replace Room with
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="replaceRoomWithImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="replaceRoomWithAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="replaceRoomWithVideo(event)" />
          </div>
        </div>
      </div>
    </div>
  `
}

export const roomPopupHTML = (): string => {
  return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div class="${styles['row']} ${styles['on-hover']}">
        Add
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="roomAddImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="roomAddAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="roomAddVideo(event)" />
          </div>
        </div>
      </div>

      <div class="${styles['row']} ${styles['on-hover']}">
        Replace Room with
        <div class="${styles['hover-func-block']}">
          <div class="${styles['upload-file-wrapper']}">
            Image
            <input type="file" accept="image/png, image/jpg, image/jpeg" onChange="replaceRoomWithImg(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Audio
            <input type="file" accept="audio/mpeg" onChange="replaceRoomWithAudio(event)" />
          </div>
          <div class="${styles['upload-file-wrapper']}">
            Video
            <input type="file" accept="video/mp4" onChange="replaceRoomWithVideo(event)" />
          </div>
        </div>
      </div>
    </div>
  `
}

export const imgBoundPopupHTML = (objectUrl: string, width: number = 100, name: string) => {
  return `
    <img 
      src="${objectUrl}" 
      style="
        position: absolute; 
        left: 50%; 
        transform: 
        translateX(-50%); 
        width: ${width}px;
        height: auto;" 
      alt="${name}" 
    />`
}

export const audioBoundPopupHTML = (objectUrl: string) => {
  return `
    <audio controls>
      <source src=${objectUrl} type="audio/mpeg">
      Your browser does not support the audio tag.
    </audio>`
}

export const videoBoundPopupHTML = (objectUrl: string, width: number = 320, height: number = 180) => {
  return `
    <video width="${width}" height="${height}" controls>
      <source src=${objectUrl} type="video/mp4">
      Your browser does not support the video tag.
    </video>`
}

export const mapElementPopupHTML = (): string => {
  //   return `
  //   <div class="${styles['popup-interact-function']} ${styles['popup-wrap']}">
  //     <div 
  //       onclick="handleSelectMapRelate('Personal Responsibility')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Personal Responsibility</div>
  //     <div 
  //       onclick="handleSelectMapRelate('Self - Contribution')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Self - Contribution</div>
  //     <div 
  //       onclick="handleSelectMapRelate('Averaging')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Averaging</div>
  //     <div 
  //       onclick="handleSelectMapRelate('Feedback')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Feedback</div>
  //     <div 
  //       onclick="handleSelectMapRelate('Correction')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Correction</div>
  //     <div 
  //       onclick="handleSelectMapRelate('Function Boundary')"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Relate with Function Boundary</div>
  //     <div 
  //       onclick="deleteEquation()"
  //       class="${styles['row']} ${styles['on-hover']}"
  //     >Delete Item </div>
  //   </div>
  // `;
  return `
    <div class="${styles['popup-interact-function']} ${styles['popup-wrap']}">
      <div 
        onclick="deleteEquation()"
        class="${styles['row']} ${styles['on-hover']}"
      >Delete Item </div>
    </div>
  `;
}

export const givenSetPopupHTML = (): string => {
    return `
    <div class="${styles['popup-interact-function']} ${styles['popup-wrap']}">
    <div 
        onclick="arrowDirectionTop()"
        class="${styles['row']} ${styles['on-hover']}"
      >Arrow Direction Top</div>
    <div 
        onclick="arrowDirectionRight()"
        class="${styles['row']} ${styles['on-hover']}"
      >Arrow Direction Right</div>
    <div 
        onclick="arrowDirectionBottom()"
        class="${styles['row']} ${styles['on-hover']}"
      >Arrow Direction Bottom</div>
    <div 
        onclick="arrowDirectionLeft()"
        class="${styles['row']} ${styles['on-hover']}"
      >Arrow Direction Left</div>
    <div 
        onclick="deleteMainSet()"
        class="${styles['row']} ${styles['on-hover']}"
      >Delete Item</div>
    </div>
  `;
}

export const imagePalletPopupHTML = (): string => {
    return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div 
        onclick="deleteImagePallet()"
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}

export const annotationPalletPopupHTML = (): string => {
    return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div 
        onclick="editStyleAnnotation()"
        class="${styles['row']}"
      >
        Edit style
      </div>
      <div 
        onclick="deleteAnnotation()"
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}

export const textPalletPopupHTML = (): string => {
    return  `
    <div 
      class="${styles['popup-wrap']} ${styles['popup-interact-function']}"
    >
      <div 
        onclick="editTextStyle()"
        class="${styles['row']}"
      >
        Edit Text Style
      </div>
      <div 
        onclick="deleteAnnotation()"
        class="${styles['row']}"
      >
        Delete Item
      </div>
    </div>
  `
}
