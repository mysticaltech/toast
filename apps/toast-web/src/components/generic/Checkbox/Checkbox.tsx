import React, { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Label from './Label';

interface CheckboxProps {
  className?: string;
  id?: string;
  value: string;
  checked: boolean;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange(ev: ChangeEvent<HTMLInputElement>): void;
}

export default class Checkbox extends React.Component<CheckboxProps> {
  static defaultProps = {
    className: null,
    id: null,
    value: '',
    required: false,
    disabled: false,
    children: null,
    onChange: () => null,
  };

  naturalId = `checkbox${Math.floor(Math.random() * 10000000)}`;

  render() {
    const {
      id,
      className,
      disabled,
      checked,
      required,
      children,
      onChange,
    } = this.props;

    const finalId = id || this.naturalId;

    return (
      <div>
        <Input
          id={finalId}
          className={className}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          required={required}
          onChange={onChange}
        />
        <Label htmlFor={finalId}>{children}</Label>
      </div>
    );
  }
}
