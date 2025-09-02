import React from "react";
import { COUNTRIES } from "../constants/countries";

interface CountrySelectProps {
  id: any;
  name: any;
  value: any;
  onChange: any;
  required?: boolean;
  placeholder?: string;
  className?: string;
  label: any;
  showRegionalGroups?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = "Select Country",
  className = "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
  label,
  showRegionalGroups = true,
}) => {
  const renderCountryOptions = (): React.ReactNode => {
    if (!showRegionalGroups) {
      return COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ));
    }

    return (
      <>
        {/* North America */}
        <optgroup label="North America">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="MX">Mexico</option>
        </optgroup>

        {/* Europe */}
        <optgroup label="Europe">
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="IT">Italy</option>
          <option value="ES">Spain</option>
          <option value="NL">Netherlands</option>
          <option value="BE">Belgium</option>
          <option value="AT">Austria</option>
          <option value="CH">Switzerland</option>
          <option value="SE">Sweden</option>
          <option value="NO">Norway</option>
          <option value="DK">Denmark</option>
          <option value="FI">Finland</option>
          <option value="IE">Ireland</option>
          <option value="PT">Portugal</option>
          <option value="PL">Poland</option>
          <option value="CZ">Czech Republic</option>
          <option value="HU">Hungary</option>
          <option value="GR">Greece</option>
          <option value="RO">Romania</option>
          <option value="BG">Bulgaria</option>
          <option value="HR">Croatia</option>
          <option value="SI">Slovenia</option>
          <option value="SK">Slovakia</option>
          <option value="EE">Estonia</option>
          <option value="LV">Latvia</option>
          <option value="LT">Lithuania</option>
          <option value="LU">Luxembourg</option>
          <option value="MT">Malta</option>
          <option value="CY">Cyprus</option>
        </optgroup>

        {/* Asia */}
        <optgroup label="Asia">
          <option value="CN">China</option>
          <option value="JP">Japan</option>
          <option value="KR">South Korea</option>
          <option value="IN">India</option>
          <option value="ID">Indonesia</option>
          <option value="TH">Thailand</option>
          <option value="VN">Vietnam</option>
          <option value="PH">Philippines</option>
          <option value="MY">Malaysia</option>
          <option value="SG">Singapore</option>
          <option value="BD">Bangladesh</option>
          <option value="PK">Pakistan</option>
          <option value="LK">Sri Lanka</option>
          <option value="MM">Myanmar</option>
          <option value="KH">Cambodia</option>
          <option value="LA">Laos</option>
          <option value="BN">Brunei</option>
          <option value="TW">Taiwan</option>
          <option value="HK">Hong Kong</option>
          <option value="MO">Macau</option>
          <option value="MN">Mongolia</option>
          <option value="NP">Nepal</option>
          <option value="BT">Bhutan</option>
          <option value="MV">Maldives</option>
        </optgroup>

        {/* Middle East */}
        <optgroup label="Middle East">
          <option value="AE">United Arab Emirates</option>
          <option value="SA">Saudi Arabia</option>
          <option value="QA">Qatar</option>
          <option value="KW">Kuwait</option>
          <option value="BH">Bahrain</option>
          <option value="OM">Oman</option>
          <option value="JO">Jordan</option>
          <option value="LB">Lebanon</option>
          <option value="IL">Israel</option>
          <option value="TR">Turkey</option>
          <option value="IR">Iran</option>
          <option value="IQ">Iraq</option>
          <option value="SY">Syria</option>
          <option value="YE">Yemen</option>
        </optgroup>

        {/* Africa */}
        <optgroup label="Africa">
          <option value="ZA">South Africa</option>
          <option value="NG">Nigeria</option>
          <option value="EG">Egypt</option>
          <option value="KE">Kenya</option>
          <option value="GH">Ghana</option>
          <option value="ET">Ethiopia</option>
          <option value="UG">Uganda</option>
          <option value="TZ">Tanzania</option>
          <option value="MA">Morocco</option>
          <option value="DZ">Algeria</option>
          <option value="TN">Tunisia</option>
          <option value="LY">Libya</option>
          <option value="SD">Sudan</option>
          <option value="SN">Senegal</option>
          <option value="CI">Côte d&apos;Ivoire</option>
          <option value="CM">Cameroon</option>
          <option value="BF">Burkina Faso</option>
          <option value="ML">Mali</option>
          <option value="NE">Niger</option>
          <option value="TD">Chad</option>
          <option value="MG">Madagascar</option>
          <option value="MW">Malawi</option>
          <option value="ZM">Zambia</option>
          <option value="ZW">Zimbabwe</option>
          <option value="BW">Botswana</option>
          <option value="NA">Namibia</option>
          <option value="SZ">Eswatini</option>
          <option value="LS">Lesotho</option>
          <option value="MU">Mauritius</option>
          <option value="RW">Rwanda</option>
          <option value="BI">Burundi</option>
          <option value="DJ">Djibouti</option>
          <option value="SO">Somalia</option>
          <option value="ER">Eritrea</option>
        </optgroup>

        {/* Oceania */}
        <optgroup label="Oceania">
          <option value="AU">Australia</option>
          <option value="NZ">New Zealand</option>
          <option value="FJ">Fiji</option>
          <option value="PG">Papua New Guinea</option>
          <option value="NC">New Caledonia</option>
          <option value="SB">Solomon Islands</option>
          <option value="VU">Vanuatu</option>
          <option value="WS">Samoa</option>
          <option value="TO">Tonga</option>
          <option value="KI">Kiribati</option>
          <option value="TV">Tuvalu</option>
          <option value="NR">Nauru</option>
          <option value="PW">Palau</option>
          <option value="MH">Marshall Islands</option>
          <option value="FM">Micronesia</option>
        </optgroup>

        {/* South America */}
        <optgroup label="South America">
          <option value="BR">Brazil</option>
          <option value="AR">Argentina</option>
          <option value="CL">Chile</option>
          <option value="PE">Peru</option>
          <option value="CO">Colombia</option>
          <option value="VE">Venezuela</option>
          <option value="EC">Ecuador</option>
          <option value="BO">Bolivia</option>
          <option value="PY">Paraguay</option>
          <option value="UY">Uruguay</option>
          <option value="GY">Guyana</option>
          <option value="SR">Suriname</option>
          <option value="GF">French Guiana</option>
        </optgroup>

        {/* Central America & Caribbean */}
        <optgroup label="Central America & Caribbean">
          <option value="GT">Guatemala</option>
          <option value="BZ">Belize</option>
          <option value="HN">Honduras</option>
          <option value="SV">El Salvador</option>
          <option value="NI">Nicaragua</option>
          <option value="CR">Costa Rica</option>
          <option value="PA">Panama</option>
          <option value="CU">Cuba</option>
          <option value="JM">Jamaica</option>
          <option value="HT">Haiti</option>
          <option value="DO">Dominican Republic</option>
          <option value="PR">Puerto Rico</option>
          <option value="TT">Trinidad and Tobago</option>
          <option value="BB">Barbados</option>
          <option value="BS">Bahamas</option>
          <option value="GD">Grenada</option>
          <option value="LC">Saint Lucia</option>
          <option value="VC">Saint Vincent and the Grenadines</option>
          <option value="AG">Antigua and Barbuda</option>
          <option value="DM">Dominica</option>
          <option value="KN">Saint Kitts and Nevis</option>
        </optgroup>
      </>
    );
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={className}
      >
        <option value="">{placeholder}</option>
        {renderCountryOptions()}
      </select>
    </div>
  );
};

export default CountrySelect;
