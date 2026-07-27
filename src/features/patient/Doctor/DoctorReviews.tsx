import React, { useMemo } from "react";
import { useGetPublicDoctorReviewsQuery } from "../../../store/api/publicApi";

type DoctorReviewsProps = {
  doctorId: number | string;
};

const DoctorReviews: React.FC<DoctorReviewsProps> = ({ doctorId }) => {
  const { data: response, isLoading } = useGetPublicDoctorReviewsQuery(
    { doctorId, page: 0, size: 5 },
    { skip: !doctorId },
  );
  const reviewPage = response?.errCode === 0 ? response.data : undefined;
  const reviews = useMemo(() => reviewPage?.items || [], [reviewPage?.items]);

  if (isLoading) {
    return <section className="doctor-reviews-card review-loading-card"><i className="fas fa-spinner fa-spin" /> Đang tải đánh giá...</section>;
  }

  if (!reviewPage || reviewPage.reviewCount === 0) {
    return (
      <section className="doctor-reviews-card doctor-reviews-empty">
        <h2><i className="fas fa-star" /> Đánh giá từ người bệnh</h2>
        <p>Bác sĩ chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm sau khi khám.</p>
      </section>
    );
  }

  return (
    <section className="doctor-reviews-card" aria-label="Đánh giá bác sĩ">
      <div className="doctor-reviews-title">
        <div>
          <h2><i className="fas fa-star" /> Đánh giá từ người bệnh</h2>
          <p>Dựa trên các lịch khám đã hoàn tất trên MediBook.</p>
        </div>
        <div className="average-rating" aria-label={`${reviewPage.averageRating} trên 5 sao`}>
          <strong>{reviewPage.averageRating.toFixed(1)}</strong>
          <span><i className="fas fa-star" /> / 5</span>
          <small>{reviewPage.reviewCount} đánh giá</small>
        </div>
      </div>
      <div className="public-review-list">
        {reviews.map((review) => (
          <article className="public-review-item" key={review.id}>
            <div className="public-review-meta">
              <strong>{review.reviewerName || "Người bệnh đã khám"}</strong>
              <span className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={star <= review.rating ? "fas fa-star active" : "far fa-star"} />
                ))}
              </span>
            </div>
            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DoctorReviews;
