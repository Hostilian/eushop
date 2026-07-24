/**
 * @eushop/web — Food Information to Consumers (FIC) Completeness Engine
 *
 * Implements Regulation (EU) No 1169/2011 completeness audit for food listings.
 * A seller listing cannot transition to published (`available = true`) unless all statutory fields pass.
 *
 * COMPLIANCE-REVIEW: Implements mandatory pre-packed distance selling disclosure rules.
 */
import { EUAllergen } from '@eushop/compliance';

export interface FoodInformationAuditProps {
  title: string;
  category: string;
  originCountryIso2: string;
  netQuantityValue: number;
  netQuantityUnit: 'g' | 'kg' | 'ml' | 'l';
  ingredientsText?: string;
  allergens: EUAllergen[] | string[];
  storageConditions?: string;
  foodBusinessOperatorName: string;
  foodBusinessOperatorAddress: string;
  nutritionDeclaration?: {
    energyKcal: number;
    fatGrams: number;
    saturatesGrams: number;
    carbohydrateGrams: number;
    sugarsGrams: number;
    proteinGrams: number;
    saltGrams: number;
  };
}

export interface FoodCompletenessResult {
  status: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  scorePercent: number;
  missingMandatoryFields: string[];
  warnings: string[];
}

export function evaluateFoodInformationCompleteness(
  props: FoodInformationAuditProps
): FoodCompletenessResult {
  const missingMandatoryFields: string[] = [];
  const warnings: string[] = [];

  if (!props.title || props.title.trim().length < 3) {
    missingMandatoryFields.push('Statutory Product Name (Title)');
  }

  if (!props.originCountryIso2 || props.originCountryIso2.length !== 2) {
    missingMandatoryFields.push('Country of Origin (ISO 3166-1 alpha-2)');
  }

  if (!props.netQuantityValue || props.netQuantityValue <= 0 || !props.netQuantityUnit) {
    missingMandatoryFields.push('Net Quantity (e.g. 500g, 1L)');
  }

  if (!props.foodBusinessOperatorName || props.foodBusinessOperatorName.trim().length === 0) {
    missingMandatoryFields.push('Food Business Operator (FBO) Legal Name');
  }

  if (!props.foodBusinessOperatorAddress || props.foodBusinessOperatorAddress.trim().length === 0) {
    missingMandatoryFields.push('Food Business Operator Address');
  }

  if (props.allergens === undefined || props.allergens === null) {
    missingMandatoryFields.push('Allergen Declaration (FIC Reg 1169/2011 Annex II)');
  }

  // Warnings
  if (!props.ingredientsText || props.ingredientsText.trim().length === 0) {
    warnings.push('Ingredients list is missing or empty');
  }

  if (!props.nutritionDeclaration) {
    warnings.push('Mandatory 7-point nutrition declaration is missing');
  }

  if (!props.storageConditions) {
    warnings.push('Special storage conditions or instructions for use not specified');
  }

  const totalMandatoryCount = 6;
  const passedCount = totalMandatoryCount - missingMandatoryFields.length;
  const scorePercent = Math.round((passedCount / totalMandatoryCount) * 100);

  let status: FoodCompletenessResult['status'] = 'PASS';
  if (missingMandatoryFields.length > 0) {
    status = 'FAIL';
  } else if (warnings.length > 0) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    status,
    scorePercent,
    missingMandatoryFields,
    warnings,
  };
}
