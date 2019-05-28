class QuotesController < ApplicationController
  def index
    @quotes = Quote.all
    render json: @quotes, status: :ok
  end

  def show
    begin
      @quote = Quote.find(params[:id])
      render json: @quote, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { message: "no quote matches that ID" }, status: :not_found
    rescue Exception
      render json: { message: "there was some other error" }, status: :internal_server_error
    end
  end

end
