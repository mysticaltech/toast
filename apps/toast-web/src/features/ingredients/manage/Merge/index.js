import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'fraql';
import { Button, Modal } from 'components/generic';
import { Picker } from 'features/ingredients';
import { H3 } from 'components/typeset';
import { withRouter } from 'react-router-dom';

const MergeIngredients = gql`
  mutation MergeIngredients($primary: ID!, $secondary: ID!) {
    mergeIngredients(primary: $primary, secondary: $secondary) {
      id
      name
      alternateNames
    }
  }
`;

class IngredientMerger extends React.Component {
  state = {
    showModal: false,
    value: null,
    error: null,
  };

  toggleModal = () =>
    this.setState(({ showModal }) => ({ showModal: !showModal }));
  setValue = value => this.setState({ value });

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.toggleModal}>Merge</Button>
        <Mutation mutation={MergeIngredients}>
          {merge => (
            <Modal visible={this.state.showModal} onClose={this.toggleModal}>
              <H3>Merge with:</H3>
              <Picker value={this.state.value} onChange={this.setValue} />
              <Button
                onClick={async () => {
                  try {
                    await merge({
                      variables: {
                        secondary: this.props.ingredientId,
                        primary: this.state.value.id,
                      },
                    });
                    this.props.history.replace(
                      `/ingredients/${this.state.value.id}`,
                    );
                  } catch (err) {
                    this.setState({ error: err });
                  }
                }}
              >
                Merge
              </Button>
              {this.state.error && <div>Error: {this.state.error.message}</div>}
            </Modal>
          )}
        </Mutation>
      </React.Fragment>
    );
  }
}

export default withRouter(IngredientMerger);
