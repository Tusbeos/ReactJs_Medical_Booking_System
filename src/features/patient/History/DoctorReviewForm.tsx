import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateDoctorReviewMutation,
  useDeleteDoctorReviewMutation,
  useGetMyDoctorReviewByBookingQuery,
  useUpdateDoctorReviewMutation,
} from "../../../store/api/publicApi";

type DoctorReviewFormProps = {
  bookingId: number;
  doctorId: number;
};

const DoctorReviewForm: React.FC<DoctorReviewFormProps> = ({
  bookingId,
  doctorId,
}) => {
  const { data: reviewResponse, isLoading, isFetching } =
    useGetMyDoctorReviewByBookingQuery(bookingId, {
      refetchOnMountOrArgChange: true,
    });
  const [createReview, { isLoading: isCreating }] = useCreateDoctorReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateDoctorReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteDoctorReviewMutation();
  const review = reviewResponse?.errCode === 0 ? reviewResponse.data : null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating || 0);
      setComment(review.comment || "");
      setIsEditing(false);
    } else if (!isFetching) {
      setRating(0);
      setComment("");
    }
  }, [review, isFetching]);

  const errorMessage = (error: any) =>
    error?.data?.errMessage ||
    error?.data?.message ||
    error?.message ||
    "Không thể lưu đánh giá. Vui lòng thử lại.";

  const handleSave = async () => {
    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét về buổi khám.");
      return;
    }

    try {
      if (review) {
        const result = await updateReview({
          reviewId: review.id,
          bookingId,
          doctorId,
          rating,
          comment: comment.trim(),
        }).unwrap();
        if (result?.errCode !== 0) {
          toast.error(result?.errMessage || "Không thể cập nhật đánh giá.");
          return;
        }
        toast.success("Đã cập nhật đánh giá bác sĩ.");
      } else {
        const result = await createReview({
          bookingId,
          doctorId,
          rating,
          comment: comment.trim(),
        }).unwrap();
        if (result?.errCode !== 0) {
          toast.error(result?.errMessage || "Không thể gửi đánh giá.");
          return;
        }
        toast.success("Cảm ơn bạn đã đánh giá bác sĩ.");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!review || !window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      const result = await deleteReview({
        reviewId: review.id,
        bookingId,
        doctorId,
      }).unwrap();
      if (result?.errCode !== 0) {
        toast.error(result?.errMessage || "Không thể xóa đánh giá.");
        return;
      }
      setRating(0);
      setComment("");
      setIsEditing(false);
      toast.success("Đã xóa đánh giá bác sĩ.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const isSaving = isCreating || isUpdating || isDeleting;
  const showEditor = !review || isEditing;

  return (
    <section className="doctor-review-form" aria-label="Đánh giá bác sĩ">
      <div className="doctor-review-heading">
        <div>
          <strong><i className="fas fa-star" /> Đánh giá bác sĩ</strong>
          <p>Đánh giá của bạn giúp người bệnh khác tham khảo tốt hơn.</p>
        </div>
        {review && !isEditing && (
          <div className="review-actions">
            <button type="button" onClick={() => setIsEditing(true)}>
              <i className="fas fa-pen" /> Sửa
            </button>
            <button type="button" className="delete-review" onClick={handleDelete} disabled={isSaving}>
              <i className="far fa-trash-alt" /> Xóa
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <span className="review-loading"><i className="fas fa-spinner fa-spin" /> Đang tải đánh giá...</span>
      ) : showEditor ? (
        <div className="review-editor">
          <div className="rating-picker" role="radiogroup" aria-label="Số sao đánh giá">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={star <= rating ? "active" : ""}
                onClick={() => setRating(star)}
                aria-label={`${star} sao`}
                aria-checked={star === rating}
                role="radio"
              >
                <i className="fas fa-star" />
              </button>
            ))}
            <span>{rating ? `${rating}/5 sao` : "Chọn số sao"}</span>
          </div>
          <textarea
            value={comment}
            maxLength={2000}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Chia sẻ trải nghiệm khám bệnh của bạn..."
            aria-label="Nhận xét về bác sĩ"
          />
          <div className="review-editor-footer">
            <span>{comment.length}/2000</span>
            <div>
              {review && (
                <button
                  type="button"
                  className="review-cancel"
                  onClick={() => {
                    setRating(review.rating || 0);
                    setComment(review.comment || "");
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Hủy
                </button>
              )}
              <button type="button" className="review-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Đang lưu..." : review ? "Lưu thay đổi" : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="review-preview">
          <div className="review-stars" aria-label={`${review?.rating || 0} trên 5 sao`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={star <= (review?.rating || 0) ? "fas fa-star active" : "far fa-star"} />
            ))}
            <span>{review?.rating}/5</span>
          </div>
          <p>{review?.comment}</p>
        </div>
      )}
    </section>
  );
};

export default DoctorReviewForm;
