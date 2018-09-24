import React from 'react';
import { HasScope } from 'features/auth/gates';
import { Recent, BulkCreate } from 'features/ingredients/manage';
import { Content, SingleColumn } from 'components/layouts';
import { H2 } from 'components/typeset';

export default class ManagePage extends React.Component {
  render() {
    return (
      <SingleColumn>
        <Content>
          <HasScope scope="ui:manage">
            <H2>Recent Ingredients</H2>
            <Recent />
            <H2>Bulk Upload Ingredients</H2>
            <BulkCreate />
          </HasScope>
        </Content>
      </SingleColumn>
    );
  }
}
