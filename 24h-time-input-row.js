const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class TimeInput extends LitElement {

  render() {
    return html`
    <hui-generic-entity-row 
      style="display: flex; align-items: center;"
      .hass="${this._hass}" 
      .config="${this._config}"
    >
      <table style="display:block; text-align:right width:55px">
        <tr> 
          <td style="width:25px">
            <paper-input
                label="H"
                .value="${this.hours}"
                id="hourinput"
                placeholder=""
                style="widht:20em"
                maxlength=2
                @click="${(ev) => ev.stopPropagation()}"
                @change="${this.valueChanged}"
              ></paper-input>
          </td>
          <td>
            </br>:
          </td>
          <td style="width:25px">
            <paper-input
              label="M"
              .value="${this.minutes_str}"
              id="minuteinput"
              placeholder=""
              style="widht:20em"
              maxlength=2
              @click="${(ev) => ev.stopPropagation()}"
              @change="${this.valueChanged}"
            ></paper-input>
          </td>
        </tr>
      </table>
    </hui-generic-entity-row>
    `;
  }
/*

                
  ready() {
    super.ready();
    this.$.minuteinput.addEventListener('click', ev => ev.stopPropagation());
    this.$.hourinput.addEventListener('click', ev => ev.stopPropagation());
    this.$.secondinput.addEventListener('click',ev => ev.stopPropagation())
  }
*/
  setConfig(config) {
	if (!config.entity){
		throw new Error('You need to define an entity');
	}
    this._config = config;
  }

  valueChanged(ev) {
    this.shadowRoot.querySelector("#hourinput").value = this.shadowRoot.querySelector("#hourinput").value % 24 ? this.shadowRoot.querySelector("#hourinput").value % 24 : 0;
	  const newMinutes = this.shadowRoot.querySelector("#minuteinput").value % 60 ? this.shadowRoot.querySelector("#minuteinput").value % 60 : 0;
    const newHours = this.shadowRoot.querySelector("#hourinput").value;
    this.shadowRoot.querySelector("#minuteinput").value = this.computeMinuteView(newMinutes)
    const param = {
      entity_id: this._config.entity,
      time: newHours + ":" + newMinutes + ":00",
    };
    this._hass.callService('input_datetime', 'set_datetime', param);
  }

  computeMinuteView(min) {
    return (min < 10) ? "0" + min : min;
  }

  computeObjectId(entityId) {
    return entityId.substr(entityId.indexOf(".") + 1);
  }

  computeStateName(stateObj){
    return stateObj.attributes.friendly_name === undefined 
    ? this.computeObjectId(stateObj.entity_id).replace(/_/g, " ") 
    : stateObj.attributes.friendly_name || "";
  }

  set hass(hass) {
    this._hass = hass;
    this.stateObj = hass.states[this._config.entity];
    if(this.stateObj) {
      this.value = this.stateObj.state;
      this.seconds = (this.stateObj.attributes.timestamp % 60);
	    this.minutes = (((this.stateObj.attributes.timestamp - this.seconds) / 60) % 60);
      this.minutes_str = this.computeMinuteView(this.minutes);
	    this.hours = ((this.stateObj.attributes.timestamp - (60 * this.minutes) -this.seconds) / 3600);
      this.label = this._config.name ? this._config.name : this.computeStateName(this.stateObj);
      this.icon = this._config.icon ? this._config.icon: this.stateObj.attributes.icon
      this.icon = (this.icon == "none") ? "" : this.icon
    }
  }
}

customElements.define('lovelace-time-input-row', TimeInput);