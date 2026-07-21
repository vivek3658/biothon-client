import React, { useState } from 'react';
import { AlertCircle, Navigation } from 'lucide-react';

export const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        {...register(name)}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
          error 
            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' 
            : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`}
      />
      {error && (
        <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </span>
      )}
    </div>
  );
};

export const SelectField = ({
  label,
  name,
  options = [],
  register,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        {...register(name)}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
          error 
            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' 
            : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'
        }`}
      >
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const labelStr = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {labelStr}
            </option>
          );
        })}
      </select>
      {error && (
        <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </span>
      )}
    </div>
  );
};

export const TextAreaField = ({
  label,
  name,
  placeholder,
  register,
  error,
  rows = 3,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
          error 
            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30' 
            : 'border-slate-200 focus:border-sky-500 hover:border-slate-300'
        }`}
      />
      {error && (
        <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </span>
      )}
    </div>
  );
};

export const CheckboxField = ({
  label,
  name,
  register,
  error,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-start gap-3 p-3.5 bg-sky-50/50 border border-sky-100 rounded-xl cursor-pointer hover:bg-sky-50 transition-colors">
        <input
          type="checkbox"
          {...register(name)}
          className="mt-0.5 w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
        />
        <span className="text-xs font-semibold text-slate-800 leading-relaxed">
          {label}
        </span>
      </label>
      {error && (
        <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </span>
      )}
    </div>
  );
};

export const GPSLocationField = ({ setValue, register, errors }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locMsg, setLocMsg] = useState('');

  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      setLocMsg('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setLocMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude.toFixed(4);
        const lat = pos.coords.latitude.toFixed(4);
        setValue('longitude', lng, { shouldValidate: true });
        setValue('latitude', lat, { shouldValidate: true });
        setLocMsg('GPS location retrieved!');
        setIsLocating(false);
      },
      (err) => {
        setLocMsg('Failed to locate: ' + err.message);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          GPS Location Coordinates
        </span>
        <button
          type="button"
          onClick={handleFetchGPS}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          {isLocating ? 'Locating...' : 'Use Current GPS'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Longitude"
          name="longitude"
          placeholder="72.5714"
          register={register}
          error={errors.longitude}
        />
        <InputField
          label="Latitude"
          name="latitude"
          placeholder="23.0225"
          register={register}
          error={errors.latitude}
        />
      </div>

      {locMsg && (
        <span className={`text-xs font-semibold ${locMsg.includes('retrieved') ? 'text-emerald-600' : 'text-amber-600'}`}>
          {locMsg}
        </span>
      )}
    </div>
  );
};
