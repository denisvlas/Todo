import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  disabled?: boolean;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder,
  disabled

}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

export default FormInput;