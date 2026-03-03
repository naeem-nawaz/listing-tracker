import React, { useState } from 'react';
import ImageUploader, { MIN_IMAGES } from './ImageUploader';
import AIStatusBadge from './AIStatusBadge';
import RiskExplanationBox from './RiskExplanationBox';
import { submitListing } from '../../api/listingsApi';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];

const CATEGORY_OPTIONS = [
  { value: 'house', label: 'House' },
  { value: 'plot', label: 'Plot' },
  { value: 'flat', label: 'Flat' },
];

const PURPOSES = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
];

const SIZE_UNITS = [
  { value: 'marla', label: 'Marla' },
  { value: 'sqft', label: 'Sq Ft' },
  { value: 'kanal', label: 'Kanal' },
];

const INITIAL_FORM = {
  user_id: '',
  title: '',
  description: '',
  property_type: 'house',
  category: 'house',
  purpose: 'sale',
  city: '',
  area: '',
  price: '',
  size: '',
  size_unit: 'marla',
  bedrooms: '',
  bathrooms: '',
};

function ListingForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const next = {};
    if (!form.user_id) next.user_id = 'User ID is required.';
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.description.trim().length < 100)
      next.description = 'Description must be at least 100 characters.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.property_type) next.property_type = 'Property type is required.';
    if (!form.category) next.category = 'Category is required.';
    if (form.price === '' || form.price === null || form.price === undefined)
      next.price = 'Price is required.';
    if (Number(form.price) < 0) next.price = 'Price must be a positive number.';
    if (form.size !== '' && Number(form.size) <= 0) next.size = 'Size must be greater than 0.';
    if (form.size === '' && !form.area.trim())
      next.area = 'Area is required if size is not provided.';
    if (images.length < MIN_IMAGES)
      next.images = `At least ${MIN_IMAGES} images are required.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toMarla = (size, unit) => {
    const n = Number(size);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (unit === 'marla') return n;
    if (unit === 'kanal') return n * 20;
    if (unit === 'sqft') return n / 272.25;
    return null;
  };

  const buildFormData = () => {
    const fd = new FormData();
    if (form.user_id !== '' && form.user_id != null) fd.append('user_id', form.user_id);
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('property_type', form.property_type);
    fd.append('category', form.category);
    fd.append('purpose', form.purpose);
    fd.append('city', form.city.trim());
    if (form.area) fd.append('area', form.area.trim());
    fd.append('price', form.price);
    if (form.size !== '') fd.append('size', form.size);
    fd.append('size_unit', form.size_unit);
    const areaMarla = toMarla(form.size, form.size_unit);
    if (areaMarla != null) fd.append('area_marla', String(areaMarla));
    if (form.bedrooms !== '') fd.append('bedrooms', form.bedrooms);
    if (form.bathrooms !== '') fd.append('bathrooms', form.bathrooms);
    images.forEach((file, i) => fd.append(`images[${i}]`, file));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setResult(null);
    setErrors({});
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildFormData();
      const data = await submitListing(payload);
      setResult(data);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 422 && data?.errors) {
        const next = {};
        Object.keys(data.errors).forEach((field) => {
          const messages = data.errors[field];
          next[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(next);
        setSubmitError('Please fix the validation errors below.');
      } else if (status >= 500 || !err.response) {
        setSubmitError(
          data?.message || data?.error || err.message || 'Server error. Please try again later.'
        );
      } else {
        setSubmitError(
          data?.message || data?.error || err.message || 'Failed to submit listing.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagesChange = (newFiles) => {
    setImages(Array.isArray(newFiles) ? newFiles : []);
    setErrors((prev) => ({ ...prev, images: '' }));
  };

  return (
    <div className="listing-form-wrap">
      <form className="listing-form" onSubmit={handleSubmit} noValidate>
        <section className="listing-form__section">
          <h2 className="listing-form__section-title">Property Info</h2>
          <div className="listing-form__row">
            <label className="listing-form__label">User ID</label>
            <input
              type="number"
              name="user_id"
              className="listing-form__input"
              min={1}
              value={form.user_id}
              onChange={(e) => update('user_id', e.target.value)}
              placeholder="User ID"
              disabled={submitting}
            />
            {errors.user_id && (
              <span className="listing-form__error">{errors.user_id}</span>
            )}
          </div>
          <div className="listing-form__row">
            <label className="listing-form__label">
              Title <span className="listing-form__required">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="listing-form__input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Property title"
              disabled={submitting}
            />
            {errors.title && (
              <span className="listing-form__error">{errors.title}</span>
            )}
          </div>
          <div className="listing-form__row">
            <label className="listing-form__label">
              Description <span className="listing-form__required">*</span> (min 100 characters)
            </label>
            <textarea
              name="description"
              className="listing-form__input listing-form__textarea"
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the property..."
              disabled={submitting}
            />
            <span className="listing-form__hint">
              {form.description.length} / 100
            </span>
            {errors.description && (
              <span className="listing-form__error">{errors.description}</span>
            )}
          </div>
          <div className="listing-form__row listing-form__row--inline">
            <div className="listing-form__field">
              <label className="listing-form__label">
                Property type <span className="listing-form__required">*</span>
              </label>
              <select
                name="property_type"
                className="listing-form__input listing-form__select"
                value={form.property_type}
                onChange={(e) => update('property_type', e.target.value)}
                disabled={submitting}
              >
                {PROPERTY_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.property_type && (
                <span className="listing-form__error">{errors.property_type}</span>
              )}
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">
                Category <span className="listing-form__required">*</span>
              </label>
              <select
                name="category"
                className="listing-form__input listing-form__select"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                disabled={submitting}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.category && (
                <span className="listing-form__error">{errors.category}</span>
              )}
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">Purpose</label>
              <select
                name="purpose"
                className="listing-form__input listing-form__select"
                value={form.purpose}
                onChange={(e) => update('purpose', e.target.value)}
                disabled={submitting}
              >
                {PURPOSES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="listing-form__row listing-form__row--inline">
            <div className="listing-form__field">
              <label className="listing-form__label">
                City <span className="listing-form__required">*</span>
              </label>
              <input
                type="text"
                name="city"
                className="listing-form__input"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="City"
                disabled={submitting}
              />
              {errors.city && <span className="listing-form__error">{errors.city}</span>}
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">
                Area / locality {form.size === '' && <span className="listing-form__required">*</span>}
              </label>
              <input
                type="text"
                name="area"
                className="listing-form__input"
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                placeholder="Area / locality"
                disabled={submitting}
              />
              {errors.area && <span className="listing-form__error">{errors.area}</span>}
            </div>
          </div>
          <div className="listing-form__row listing-form__row--inline">
            <div className="listing-form__field">
              <label className="listing-form__label">
                Price <span className="listing-form__required">*</span>
              </label>
              <input
                type="number"
                name="price"
                className="listing-form__input"
                min={0}
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="0"
                disabled={submitting}
              />
              {errors.price && (
                <span className="listing-form__error">{errors.price}</span>
              )}
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">Size (for area_marla)</label>
              <input
                type="number"
                name="size"
                className="listing-form__input"
                min={0}
                value={form.size}
                onChange={(e) => update('size', e.target.value)}
                placeholder="0"
                disabled={submitting}
              />
              {errors.size && <span className="listing-form__error">{errors.size}</span>}
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">Size unit</label>
              <select
                name="size_unit"
                className="listing-form__input listing-form__select"
                value={form.size_unit}
                onChange={(e) => update('size_unit', e.target.value)}
                disabled={submitting}
              >
                {SIZE_UNITS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="listing-form__row listing-form__row--inline">
            <div className="listing-form__field">
              <label className="listing-form__label">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                className="listing-form__input"
                min={0}
                value={form.bedrooms}
                onChange={(e) => update('bedrooms', e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="listing-form__field">
              <label className="listing-form__label">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                className="listing-form__input"
                min={0}
                value={form.bathrooms}
                onChange={(e) => update('bathrooms', e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        </section>

        <section className="listing-form__section">
          <h2 className="listing-form__section-title">Media</h2>
          <ImageUploader
            images={images}
            onImagesChange={handleImagesChange}
            error={errors.images}
            disabled={submitting}
          />
        </section>

        {submitError && (
          <div className="listing-form__submit-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="listing-form__actions">
          <button
            type="submit"
            className="listing-form__submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="listing-form__spinner" aria-hidden /> Submitting...
              </>
            ) : (
              'Submit Listing'
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="listing-form__result">
          <p className="listing-form__success-msg">
            Listing submitted successfully.
          </p>
          <AIStatusBadge
            status={result.ai_status}
            fraud_score={result.fraud_score != null ? result.fraud_score : undefined}
          />
          <RiskExplanationBox risk_reason_json={result.risk_reason_json} />
        </div>
      )}
    </div>
  );
}

export default ListingForm;
