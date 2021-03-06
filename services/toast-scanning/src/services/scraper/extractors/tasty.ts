import { Page } from 'puppeteer';

const tasty = async (page: Page) => {
  console.log('trying tasty');
  return await page.evaluate(() => {
    /**
     * All extraction code must go inside this block
     * to be sent to the browser.
     */

    function textContent(el) {
      return el && el.textContent;
    }

    function toIsoDuration(minsString) {
      if (!minsString) {
        return null;
      }

      var hoursResult = /(\d+)\s+(hours?)/.exec(minsString);
      var minutesResult = /(\d+)\s+(mins?)/i.exec(minsString);

      if (hoursResult || minutesResult) {
        var hours = hoursResult && hoursResult[1];
        var mins = minutesResult && minutesResult[1];

        var duration = 'PT';
        if (hours) {
          duration += hours + 'H';
        }
        if (mins) {
          duration += mins + 'M';
        }
        return duration;
      }

      return null;
    }

    function toYield(yieldStr) {
      if (!yieldStr) {
        return null;
      }
      return parseInt(yieldStr);
    }

    var tastyRoot = document.querySelector('.tasty-recipes');

    if (!tastyRoot) {
      return null;
    }

    var titleElement = tastyRoot.querySelector(
      '.tasty-recipes-header-content > h2',
    );
    var authorElement = tastyRoot.querySelector('.tasty-recipes-author-name');
    var prepTimeElement = tastyRoot.querySelector('.tasty-recipes-prep-time');
    var cookTimeElement = tastyRoot.querySelector('.tasty-recipes-cook-time');
    var totalTimeElement = tastyRoot.querySelector('.tasty-recipes-total-time');
    var servingsElement = tastyRoot.querySelector('.tasty-recipes-yield');
    var ingredientsList = tastyRoot.querySelectorAll(
      '.tasty-recipes-ingredients > ul > li',
    );
    var instructionsList = tastyRoot.querySelectorAll(
      '.tasty-recipes-instructions > ol > li',
    );
    var imageElement = tastyRoot.querySelector('.tasty-recipes-image > img');

    var ingredientsText = [];
    ingredientsList.forEach(function(el) {
      ingredientsText.push(textContent(el));
    });

    var stepsText = [];
    instructionsList.forEach(function(el) {
      stepsText.push(textContent(el));
    });

    var prepTime = toIsoDuration(textContent(prepTimeElement));
    var cookTime = toIsoDuration(textContent(cookTimeElement));
    var totalTime = toIsoDuration(textContent(totalTimeElement));

    var data = {
      name: textContent(titleElement),
      author: textContent(authorElement),
      image: imageElement && imageElement.getAttribute('src'),
      prepTime: prepTime,
      cookTime: cookTime,
      totalTime: totalTime,
      recipeYield: toYield(textContent(servingsElement)),
      recipeIngredient: ingredientsText,
      recipeInstructions: stepsText,
      copyrightHolder: textContent(authorElement),
    };

    return data;
  });
};

export default tasty;
