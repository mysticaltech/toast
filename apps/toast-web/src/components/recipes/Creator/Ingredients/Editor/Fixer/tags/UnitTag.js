// @flow

import React, { type Node } from 'react';
import EditableTag from './EditableTag';
import { toReadableFraction } from 'readable-fractions';
import { Formik } from 'formik';
import { Field, Input, Button } from 'components/generic';

type Props = {
  value: string,
  onChangeSelection(): mixed,
  children: Node,
};

export default class UnitTag extends React.PureComponent<Props> {
  render() {
    const { value, onChangeSelection, children } = this.props;

    return (
      <EditableTag color="negative" onChangeSelection={onChangeSelection}>
        {children}
      </EditableTag>
    );
  }
}
